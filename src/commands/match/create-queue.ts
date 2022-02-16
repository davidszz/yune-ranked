import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton, User } from 'discord.js';
import { on } from 'events';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { YuneEmbed } from '@structures/YuneEmbed';
import { CreateUrl, MatchStatus, Emojis } from '@utils/Constants';

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
				if (['idle', 'time'].includes(reason)) {
					try {
						await reply.delete();
					} catch {
						// Nothing
					}
				}
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
							// Nothing
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
					} else if (i.customId === 'left') {
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
						user: participant,
					})
				);
			}

			const embed = new YuneEmbed()
				.setColor('DARKER_GREY')
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
		async function collectorFilter(i: ButtonInteraction) {
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

				this.stop();
				participants.splice(0, teamSize * 2);
				removeQueuedMembers();

				interaction.editReply({
					content: 'Partida cancelada.',
					embeds: [],
					components: [],
				});

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
			const participantsIds = participants.map((x) => x.id);
			client.queueMembers = interaction.client.queueMembers.filter((x) => !participantsIds.includes(x.id));
		}
	}
}
