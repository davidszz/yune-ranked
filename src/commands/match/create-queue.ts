import {
	ButtonInteraction,
	CommandInteraction,
	InteractionCollector,
	MessageActionRow,
	MessageButton,
	User,
} from 'discord.js';
import { on } from 'events';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { MatchStartTemplate } from '@structures/canvas/templates/MatchStartTemplate';
import { Command } from '@structures/Command';
import { YuneEmbed } from '@structures/YuneEmbed';
import { DEFAULT_USER_MMR, Emojis, Images, MatchStatus } from '@utils/Constants';
import { RankUtils } from '@utils/RankUtils';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'criar-fila',
			description: 'Cria uma fila para iniciar uma partida',
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply();

		const { teamSize } = await interaction.client.database.guilds.findOne(interaction.guildId, 'teamSize');
		const participants: User[] = [interaction.user];

		if (interaction.client.queueMembers.includes(interaction.user.id)) {
			await interaction.editReply({
				content: t('create_queue.errors.already_in_queue'),
			});
			return;
		}

		const currentUserMatch = await interaction.client.database.matches.findOne({
			'teams.members': interaction.user.id,
			status: MatchStatus.IN_GAME,
		});

		if (currentUserMatch) {
			const channelUrl = `https://discord.com/channels/${interaction.guildId}/${currentUserMatch.channelId}`;
			await interaction.editReply({
				content: t('create_queue.errors.already_in_game', {
					match_id: currentUserMatch.matchId,
					channel_url: channelUrl,
				}),
			});
			return;
		}

		interaction.client.queueMembers.push(interaction.user.id);

		const reply = await interaction
			.editReply({
				embeds: [generateEmbed()],
				components: [generateButtons()],
			})
			.catch(async () => {
				interaction.client.queueMembers.splice(interaction.client.queueMembers.indexOf(interaction.user.id), 1);
				try {
					await interaction.followUp({
						content: t('create_queue.errors.unknown_error'),
					});
				} catch {
					// Nothing
				}
			});

		if (!reply) return;

		const queueUrl = `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${reply.id}`;

		const collector = new InteractionCollector<ButtonInteraction>(interaction.client, {
			message: reply,
			componentType: 'BUTTON',
			interactionType: 'MESSAGE_COMPONENT',
			time: 5 * 60000,
			filter: async (i) => {
				if (i.customId === 'join') {
					if (participants.some((x) => x?.id === i.user.id)) {
						await i.reply({
							content: t('create_queue.errors.already_joined'),
							ephemeral: true,
						});
						return false;
					}

					if (interaction.client.queueMembers.includes(i.user.id)) {
						await i.reply({
							content: t('create_queue.errors.already_in_queue'),
							ephemeral: true,
						});
						return false;
					}
				}

				if (i.customId === 'left') {
					if (i.user.id === interaction.user.id) {
						await i.reply({
							content: t('create_queue.errors.cannot_left'),
							ephemeral: true,
						});
						return false;
					}

					if (!participants.some((x) => x?.id === i.user.id)) {
						await i.reply({
							content: t('create_queue.errors.not_in_queue'),
							ephemeral: true,
						});
						return false;
					}
				}

				if (i.customId === 'destroy' && i.user.id !== interaction.user.id) {
					await i.reply({
						content: t('create_queue.errors.cannot_destroy'),
						ephemeral: true,
					});
					return false;
				}

				await i.deferReply({ ephemeral: true });
				return true;
			},
		});

		collector.on('end', async (_, reason) => {
			for (const { id } of participants) {
				interaction.client.queueMembers.splice(interaction.client.queueMembers.indexOf(id), 1);
			}

			if (['time', 'idle'].includes(reason)) {
				try {
					await interaction.deleteReply();
				} catch {
					// Nothing
				}
			}
		});

		for await (const [i] of on(collector, 'collect') as AsyncIterableIterator<[ButtonInteraction]>) {
			if (collector.ended) {
				await i.editReply({
					content: t('create_queue.errors.ended', {
						owner: interaction.user.toString(),
						queue_url: queueUrl,
					}),
				});
				continue;
			}

			const editEmbed = () =>
				interaction.editReply({
					embeds: [generateEmbed()],
					components: [generateButtons()],
				});

			if (i.customId === 'join') {
				if (interaction.client.queueMembers.includes(i.user.id)) {
					await i.reply({
						content: t('create_queue.errors.already_in_queue'),
						ephemeral: true,
					});
				}

				const currentUserMatch = await interaction.client.database.matches.findOne({
					'teams.members': i.user.id,
					status: MatchStatus.IN_GAME,
				});

				if (currentUserMatch) {
					const channelUrl = `https://discord.com/channels/${interaction.guildId}/${currentUserMatch.channelId}`;
					await interaction.editReply({
						content: t('create_queue.errors.already_in_game', {
							match_id: currentUserMatch.matchId,
							channel_url: channelUrl,
						}),
					});
					continue;
				}

				if (!participants.some((x) => x?.id === i.user.id)) {
					const addParticipant = () => {
						const randIdx = Math.floor(Math.random() * (teamSize * 2));
						if (participants[randIdx]) {
							addParticipant();
						} else {
							participants[randIdx] = i.user;
						}
					};

					addParticipant();

					if (participants.filter(Boolean).length >= teamSize * 2) {
						collector.stop();
						await i.editReply({
							content: t('create_queue.joined', { target: interaction.user.toString() }),
						});
						await startMatch();
					} else {
						await editEmbed();
						await i.editReply({
							content: t('create_queue.joined', { target: interaction.user.toString() }),
						});
					}
				} else {
					await i.editReply({
						content: t('create_queue.errors.already_joined'),
					});
				}
			}

			if (i.customId === 'left' && participants.some((x) => x?.id === i.user.id)) {
				participants[participants.findIndex((x) => x?.id === i.user.id)] = null;

				await editEmbed();
				await i.editReply({
					content: t('create_queue.left', { target: interaction.user.toString() }),
				});
			}

			if (i.customId === 'destroy') {
				collector.stop();

				const destroyedEmbed = new YuneEmbed()
					.setColor('RED')
					.setAuthor({
						name: t('create_queue.embeds.destroyed.author', { user: interaction.user.tag }),
						iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }),
					})
					.setTitle(t('create_queue.embeds.destroyed.title'))
					.setDescription(t('create_queue.embeds.destroyed.description'))
					.addField(
						t('create_queue.embeds.destroyed.fields.started_at.name'),
						t('create_queue.embeds.destroyed.fields.started_at.value', {
							started_at: interaction.createdAt,
						}),
						true
					)
					.addField(
						t('create_queue.embeds.destroyed.fields.ended_at.name'),
						t('create_queue.embeds.destroyed.fields.ended_at.value', {
							ended_at: Date.now(),
						}),
						true
					)
					.setTimestamp();

				participants.splice(0, participants.length);

				await interaction.editReply({
					embeds: [destroyedEmbed],
					components: [],
				});

				await i.editReply({
					content: t('create_queue.destroyed', {
						queue_url: queueUrl,
					}),
				});
			}
		}

		async function startMatch() {
			const participantsData = await interaction.client.database.members.findMany(
				{
					guildId: interaction.guildId,
					userId: {
						$in: participants.filter(Boolean).map((x) => x.id),
					},
				},
				'userId mmr rank'
			);

			const totalMmr = participants.filter(Boolean).reduce((acc, val) => {
				const userMmr = participantsData.find((x) => x.userId === val.id)?.mmr ?? DEFAULT_USER_MMR;
				return acc + userMmr;
			}, 0);

			const matchRank = RankUtils.getRankByMmr(Math.ceil(totalMmr / (teamSize * 2)));
			const matchId = 1;

			const template = new MatchStartTemplate(
				t,
				[...participants, await interaction.client.users.fetch('880531696376746035')].map((user) => {
					const participantData = participantsData.find((x) => x.userId === user.id);
					return {
						user,
						rank: participantData?.rank ?? 'unranked',
					};
				})
			);

			const buffer = await template.build();

			const startedEmbed = new YuneEmbed()
				.setColor('GREEN')
				.setAuthor({
					name: t('create_queue.embeds.started.author', { user: interaction.user.tag }),
					iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }),
				})
				.setTitle(t('create_queue.embeds.started.title'))
				.setDescription(
					t('create_queue.embeds.started.description', {
						match_rank: t(`misc:ranks.${matchRank.rank}`, {
							context: 'division',
							division: matchRank.division,
						}),
					})
				)
				.setImage('attachment://participants.png')
				.setFooter({
					text: t('create_queue.embeds.started.footer', { match_id: matchId }),
				})
				.setTimestamp();

			const matchBtn = new MessageButton()
				.setStyle('LINK')
				.setLabel(t('create_queue.buttons.match_shortcut'))
				.setURL(`https://discord.com/channels/${interaction.guildId}/${interaction.channelId}`);

			await interaction.editReply({
				embeds: [startedEmbed],
				components: [new MessageActionRow().addComponents(matchBtn)],
				files: [{ attachment: buffer, name: 'participants.png' }],
			});
		}

		function generateEmbed() {
			const parsedParticipants: string[] = [];

			for (let i = 0; i < teamSize * 2; i++) {
				const participant = participants[i];
				if (participant) {
					parsedParticipants.push(t('create_queue.embeds.queue.fields.accepted_user', { position: i + 1 }));
				} else {
					parsedParticipants.push(t('create_queue.embeds.queue.fields.empty_user'));
				}
			}

			return new YuneEmbed()
				.setAuthor({
					name: t('create_queue.embeds.queue.author', { user: interaction.user.tag }),
					iconURL: interaction.user.displayAvatarURL({ format: 'png', dynamic: true }),
				})
				.setDescription(t('create_queue.embeds.queue.description'))
				.addField(
					t('create_queue.embeds.queue.fields.team_1.name'),
					parsedParticipants.slice(0, teamSize).join('\n'),
					true
				)
				.addField(
					t('create_queue.embeds.queue.fields.team_2.name'),
					parsedParticipants.slice(teamSize, teamSize * 2).join('\n'),
					true
				)
				.setFooter({
					text: t('create_queue.embeds.queue.footer'),
					iconURL: Images.icons.tip,
				});
		}

		function generateButtons() {
			const joinBtn = new MessageButton()
				.setCustomId('join')
				.setStyle('SUCCESS')
				.setLabel(t('create_queue.buttons.join', { amount: participants.filter(Boolean).length, max: teamSize * 2 }))
				.setEmoji(Emojis.join);

			const leftBtn = new MessageButton()
				.setCustomId('left')
				.setStyle('SECONDARY')
				.setLabel(t('create_queue.buttons.left'))
				.setEmoji(Emojis.left);

			const destroyBtn = new MessageButton()
				.setCustomId('destroy')
				.setStyle('DANGER')
				.setLabel(t('create_queue.buttons.destroy'));

			return new MessageActionRow().addComponents([joinBtn, leftBtn, destroyBtn]);
		}
	}
}
