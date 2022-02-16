import {
	ButtonInteraction,
	CommandInteraction,
	InteractionCollector,
	MessageActionRow,
	MessageAttachment,
	MessageButton,
	TextBasedChannel,
	User,
} from 'discord.js';
import { on } from 'events';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { MatchStartTemplate } from '@structures/canvas/templates/MatchStartTemplate';
import { Command } from '@structures/Command';
import { YuneEmbed } from '@structures/YuneEmbed';
import { CreateUrl, MatchStatus, Emojis, UserRank, DEFAULT_USER_MMR, Ranks } from '@utils/Constants';
import { RankUtils } from '@utils/RankUtils';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'criar-fila',
			description: 'Cria uma fila para iniciar uma partida',
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		const reply = await interaction.deferReply({ fetchReply: true });

		const { teamSize, hideParticipantNames } = await interaction.client.database.guilds.findOne(
			interaction.guildId,
			'hideParticipantNames teamSize'
		);

		const participants: User[] = [interaction.user];
		const { client, channel, guild } = interaction;

		if (client.queueMembers.some((x) => x.id === interaction.user.id)) {
			const memberQueue = client.queueMembers.find((x) => x.id === interaction.user.id);
			interaction.editReply({
				content: t('create_queue.errors.already_in_queue', {
					message_url: CreateUrl.message({
						guildId: guild.id,
						channelId: memberQueue.channelId,
						messageId: memberQueue.messageId,
					}),
				}),
			});
			return;
		}

		// Check if user is in game
		const getMatchByUserId = (userId: string) =>
			client.database.matches
				.findOne({
					'participants.userId': userId,
					status: MatchStatus.IN_GAME,
				})
				.then((res) => (res?._id ? res : null));

		const currentAuthorMatch = await getMatchByUserId(interaction.user.id);
		if (currentAuthorMatch) {
			interaction.editReply({
				content: t('create_queue.errors.already_in_game', {
					match_id: currentAuthorMatch.matchId,
					chat_url: CreateUrl.channel({ guildId: guild.id, channelId: currentAuthorMatch.channels.chat }),
				}),
			});
			return;
		}

		interaction.client.queueMembers.push({
			id: interaction.user.id,
			channelId: channel.id,
			messageId: reply.id,
		});

		try {
			await interaction.editReply({
				embeds: [queueEmbed()],
				components: [buttons()],
			});

			const collector = reply.createMessageComponentCollector({
				componentType: 'BUTTON',
				time: 5 * 60000,
				filter: collectorFilter,
			});

			collector.on('end', async (_, reason) => {
				removeQueuedMembers();

				if (reason === 'created') {
					await interaction.editReply({
						embeds: [creatingEmbed()],
						components: [],
					});

					const participantsData = await client.database.members.findMany(
						{
							guildId: guild.id,
							userId: {
								$in: participants.filter(Boolean).map((x) => x.id),
							},
						},
						'rank mmr userId'
					);

					const matchImageTemplate = new MatchStartTemplate(
						t,
						participants.map((x, i) => {
							const participantData = participantsData.find((d) => d.userId === x.id);
							return {
								rank: participantData?.rank ?? UserRank.UNRANKED,
								user: x,
								isCaptain: [0, teamSize].includes(i),
							};
						})
					);

					const imageBuffer = await matchImageTemplate.build();
					const attachment = new MessageAttachment(imageBuffer, 'match.png');

					const totalMmr = participants
						.filter(Boolean)
						.reduce(
							(acc, val) => acc + (participantsData.find((x) => x.userId === val.id)?.mmr ?? DEFAULT_USER_MMR),
							0
						);

					const matchRank = Ranks[RankUtils.getRankByMmr(totalMmr / participants.filter(Boolean).length)];

					const matchData = await client.database.matches.createMatch({
						guild,
						queueChannel: channel,
						teamSize,
						participants: participants.filter(Boolean).map((x) => ({
							id: participantsData.find((p) => p.userId === x.id)._id,
							user: x,
						})),
					});

					const chatChannel = guild.channels.cache.get(matchData.channels.chat) as TextBasedChannel;
					if (chatChannel) {
						const mapParticipants = (users: User[]) =>
							users.map((x, i) => `${x}${[0, teamSize].includes(i) ? ` ${Emojis.crown}` : ''}`).join('\n');

						const chatEmbed = new YuneEmbed()
							.setColor('DEFAULT')
							.setAuthor({
								name: t('create_queue.embeds.chat.author', {
									match_id: matchData.matchId,
								}),
								iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true }),
							})
							.setDescription(t('create_queue.embeds.chat.description'))
							.addFields([
								{
									name: t('create_queue.embeds.chat.fields.team_blue'),
									value: mapParticipants(participants.slice(0, teamSize)),
									inline: true,
								},
								{
									name: t('create_queue.embeds.chat.fields.team_red'),
									value: mapParticipants(participants.slice(teamSize, teamSize * 2)),
									inline: true,
								},
							])
							.setFooter({
								text: t('create_queue.embeds.chat.footer'),
								iconURL: guild.iconURL({ format: 'png', dynamic: true }),
							});

						await chatChannel.send({
							content: participants.join(' '),
							embeds: [chatEmbed],
						});
					}

					await interaction.editReply({
						embeds: [
							startedEmbed({
								matchRank: t(`misc:ranks.${matchRank.name}`, {
									context: matchRank.division ? 'division' : null,
									division: matchRank.division,
								}),
								matchId: 1,
							}),
						],
						components: [
							{
								type: 'ACTION_ROW',
								components: [
									{
										type: 'BUTTON',
										url: CreateUrl.channel({ guildId: guild.id, channelId: matchData.channels.chat }),
										style: 'LINK',
										label: t('create_queue.buttons.goto_match'),
									},
								],
							},
						],
						files: [attachment],
					});
					return;
				}

				participants.splice(0, teamSize * 2);
				const cancelData = {} as { reason: string; destroyedBy: string };

				if (reason === 'destroyed') {
					cancelData.reason = t('create_queue.embeds.destroyed.fields.reason.values.destroyed');
					cancelData.destroyedBy = interaction.user.toString();
				} else if (['idle', 'time'].includes(reason)) {
					cancelData.reason = t('create_queue.embeds.destroyed.fields.reason.values.time');
					cancelData.destroyedBy = t('create_queue.embeds.destroyed.fields.destroyed_by.values.system');
				} else {
					return;
				}

				await interaction.editReply({
					embeds: [destroyedEmbed(cancelData)],
					components: [],
				});
			});

			for await (const [i] of on(collector, 'collect') as AsyncIterableIterator<[ButtonInteraction]>) {
				try {
					if (collector.ended) {
						await i.editReply({
							content: t('create_queue.errors.queue_ended'),
						});
						continue;
					}

					if (i.customId === 'join') {
						if (participants.some((x) => x?.id === i.user.id)) {
							i.editReply({
								content: t('create_queue.errors.already_in'),
							});
							continue;
						}

						if (client.queueMembers.some((x) => x.id === i.user.id)) {
							i.editReply({
								content: t('create_queue.errors.already_in_queue'),
							});
							continue;
						}

						const currentMatch = await getMatchByUserId(i.user.id);
						if (currentMatch) {
							i.editReply({
								content: t('create_queue.errors.already_in_game', {
									match_id: currentMatch.matchId,
									chat_url: CreateUrl.channel({ guildId: guild.id, channelId: currentMatch.channels.chat }),
								}),
							});
							continue;
						}

						addParticipant(i.user);
						client.queueMembers.push({
							id: i.user.id,
							channelId: channel.id,
							messageId: reply.id,
						});

						if (participants.filter(Boolean).length >= teamSize * 2) {
							collector.stop('created');
						} else {
							await interaction.editReply({
								embeds: [queueEmbed()],
								components: [buttons()],
							});
						}

						await i.editReply({
							content: t('create_queue.joined', {
								user: i.user.toString(),
							}),
						});
					} else if (i.customId === 'leave') {
						if (!participants.some((x) => x?.id === i.user.id)) {
							i.editReply({
								content: t('create_queue.errors.not_in_queue'),
							});
							continue;
						}

						participants.splice(
							participants.findIndex((x) => x?.id === i.user.id),
							1
						);

						client.queueMembers.splice(
							client.queueMembers.findIndex((x) => x.id === i.user.id),
							1
						);

						await interaction.editReply({
							embeds: [queueEmbed()],
							components: [buttons()],
						});

						await i.editReply({
							content: t('create_queue.leave', {
								user: i.user.toString(),
							}),
						});
					}
				} catch {
					// Nothing
				}
			}
		} catch {
			removeQueuedMembers();
			participants.splice(0, teamSize * 2);
		}

		/**
		 * Embed functions
		 */
		function queueEmbed() {
			const formattedParticipants: string[] = [];
			for (let i = 0; i < teamSize * 2; i++) {
				const participant = participants[i];
				const nameContext = hideParticipantNames ? 'anonymous' : null;
				formattedParticipants.push(
					t('create_queue.embeds.queue.fields.misc.participant', {
						context: participant ? nameContext : 'waiting',
						position: i + 1,
						user: participant?.toString(),
					})
				);
			}

			const embed = new YuneEmbed()
				.setColor('DEFAULT')
				.setAuthor({
					name: t('create_queue.embeds.queue.author', { user: interaction.user.tag }),
					iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }),
				})
				.setDescription(t('create_queue.embeds.queue.description'))
				.addFields([
					{
						name: t('create_queue.embeds.queue.fields.team_blue'),
						value: formattedParticipants.slice(0, teamSize).join('\n'),
						inline: true,
					},
					{
						name: t('create_queue.embeds.queue.fields.team_red'),
						value: formattedParticipants.slice(teamSize, teamSize * 2).join('\n'),
						inline: true,
					},
				])
				.setFooter({
					text: t('create_queue.embeds.queue.footer'),
				});

			return embed;
		}

		function destroyedEmbed(data: { reason: string; destroyedBy: string }) {
			return new YuneEmbed()
				.setColor('RED')
				.setAuthor({
					name: t('create_queue.embeds.destroyed.author', {
						user: interaction.user.tag,
					}),
					iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }),
				})
				.setDescription(t('create_queue.embeds.destroyed.description'))
				.addFields([
					{
						name: t('create_queue.embeds.destroyed.fields.reason.name'),
						value: data.reason,
						inline: true,
					},
					{
						name: t('create_queue.embeds.destroyed.fields.destroyed_by.name'),
						value: data.destroyedBy,
						inline: true,
					},
				])
				.setFooter({
					text: t('create_queue.embeds.destroyed.footer'),
					iconURL: guild.iconURL({ format: 'png', dynamic: true }),
				})
				.setTimestamp();
		}

		function creatingEmbed() {
			return new YuneEmbed()
				.setColor('YELLOW')
				.setTitle(t('create_queue.embeds.creating.title'))
				.setDescription(
					t('create_queue.embeds.creating.description', {
						participants: participants
							.filter(Boolean)
							.map((x) => x.toString())
							.join(' '),
					})
				)
				.setFooter({
					text: t('create_queue.embeds.creating.footer'),
				});
		}

		function startedEmbed(data: { matchRank: string; matchId: number }) {
			return new YuneEmbed()
				.setColor('GREEN')
				.setAuthor({
					name: t('create_queue.embeds.started.author', {
						user: interaction.user.tag,
					}),
					iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }),
				})
				.setDescription(
					t('create_queue.embeds.started.description', {
						match_rank: data.matchRank,
					})
				)
				.setImage('attachment://match.png')
				.setFooter({
					text: t('create_queue.embeds.started.footer', {
						match_id: data.matchId,
					}),
				});
		}

		/**
		 * Generate buttons function
		 */
		function buttons() {
			const joinBtn = new MessageButton()
				.setCustomId('join')
				.setStyle('SUCCESS')
				.setEmoji(Emojis.join)
				.setLabel(
					t('create_queue.buttons.join', {
						total: participants.filter(Boolean).length,
						max: teamSize * 2,
					})
				);

			const leaveBtn = new MessageButton()
				.setCustomId('leave')
				.setStyle('SECONDARY')
				.setEmoji(Emojis.left)
				.setLabel(t('create_queue.buttons.leave'));

			const destroyBtn = new MessageButton()
				.setCustomId('destroy')
				.setStyle('DANGER')
				.setLabel(t('create_queue.buttons.destroy'));

			return new MessageActionRow().addComponents([joinBtn, leaveBtn, destroyBtn]);
		}

		/**
		 * Helper functions
		 */
		async function collectorFilter(this: InteractionCollector<ButtonInteraction>, i: ButtonInteraction) {
			const isAuthor = i.user.id === interaction.user.id;
			const alreadyIn = participants.some((x) => x?.id === i.user.id);

			if (i.customId === 'join') {
				if (alreadyIn) {
					i.reply({
						content: t('create_queue.errors.already_in'),
						ephemeral: true,
					});
					return false;
				}
			} else if (i.customId === 'leave') {
				if (isAuthor) {
					i.reply({
						content: t('create_queue.errors.cannot_leave'),
						ephemeral: true,
					});
					return false;
				}

				if (!alreadyIn) {
					i.reply({
						content: t('create_queue.errors.not_in_queue'),
						ephemeral: true,
					});
					return false;
				}
			} else if (i.customId === 'destroy') {
				if (!isAuthor) {
					i.reply({
						content: t('create_queue.errors.cannot_destroy'),
						ephemeral: true,
					});
					return false;
				}

				this.stop('destroyed');
				i.deferUpdate();
				return false;
			}

			await i.deferReply({ ephemeral: true });
			return true;
		}

		function addParticipant(user: User) {
			if (participants.length >= teamSize * 2) {
				return;
			}

			const idx = Math.floor(Math.random() * (teamSize * 2));
			if (participants[idx]) {
				addParticipant(user);
			} else {
				participants[idx] = user;
			}
		}

		function removeQueuedMembers() {
			const participantsIds = participants.filter(Boolean).map((x) => x.id);
			client.queueMembers = client.queueMembers.filter((x) => !participantsIds.includes(x.id));
		}
	}
}
