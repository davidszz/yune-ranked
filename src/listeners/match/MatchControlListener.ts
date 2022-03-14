import { ActionRow, Channel, ComponentType, Interaction, SelectMenuComponent } from 'discord.js';

import type { Yune } from '@client';
import { finalizeMatch } from '@functions/match/finalizeMatch';
import { generateDashboardEmbed } from '@functions/match/generateDashboardEmbed';
import { tFunction } from '@functions/misc/tFunction';
import { ConfirmationEmbed } from '@structures/ConfirmationEmbed';
import { EventListener } from '@structures/EventListener';
import { YuneEmbed } from '@structures/YuneEmbed';
import { EmojisIds } from '@utils/Emojis';
import { MatchStatus } from '@utils/MatchStatus';
import { TeamId } from '@utils/TeamId';

export default class MatchControlListener extends EventListener {
	actionsCache: string[];

	constructor(client: Yune) {
		super(client, {
			events: ['interactionCreate', 'channelDelete'],
		});

		this.actionsCache = [];
	}

	async onInteractionCreate(interaction: Interaction) {
		if (!interaction.isSelectMenu()) {
			return;
		}

		if (interaction.customId !== 'match_dashboard') {
			return;
		}

		const match = interaction.client.matches.getByChatChannel(interaction.channelId);
		if (!match?.inGame) {
			return;
		}

		const t = tFunction(interaction.guildLocale ?? 'pt-BR');

		if (this.actionsCache.includes(interaction.channelId)) {
			await interaction.reply({
				content: t('events:match_control.errors.only_one_action'),
				ephemeral: true,
			});
			return;
		}

		const refreshDashboard = () =>
			interaction.editReply({
				embeds: [generateDashboardEmbed({ t, match, teamSize: match.participants.size / 2 })],
				components: interaction.message.components,
			});

		const customId = interaction.values[0];
		if (customId === 'set_mvp') {
			if (!match.isCaptain(interaction.user.id) && !interaction.memberPermissions.has('Administrator')) {
				await interaction.reply({
					content: t('events:match_control.errors.no_permission'),
					ephemeral: true,
				});
				return;
			}

			this.actionsCache.push(interaction.channelId);
			await interaction.deferUpdate();
			const reply = await interaction.channel?.send({
				content: t('events:match_control.provide_a_mvp', { user: interaction.user.toString() }),
			});

			const collector = interaction.channel.createMessageCollector({
				time: 60000,
				filter: (msg) => msg.author.id === interaction.user.id,
			});

			collector.on('collect', async (msg) => {
				if (['cancel', 'cancelar'].includes(msg.content.toLowerCase())) {
					collector.stop('canceled');
					reply.delete().catch(() => undefined);
					await confirmationCanceled();
					return;
				}

				const target = msg.mentions.members.first() ?? msg.guild.members.cache.get(msg.content);
				if (!target) {
					return;
				}

				if (!match.isParticipant(target.id)) {
					await msg.reply({
						content: t('events:match_control.errors.invalid_match_participant'),
					});
					return;
				}

				collector.stop('selected');
				reply.delete().catch(() => undefined);

				try {
					if (match.isCaptain(interaction.user.id)) {
						const confirmationEmbed = new YuneEmbed()
							.setColor('Default')
							.setTitle(t('events:match_control.embeds.confirmation_mvp.title'))
							.setDescription(
								t('events:match_control.embeds.confirmation_mvp.description', {
									target: target.toString(),
								})
							);

						const confirmation = new ConfirmationEmbed({
							users: [...match.captains.values()].map((x) => x.user),
							embed: confirmationEmbed,
							target: msg.channel,
							replyTo: msg.id,
							t,
						});

						const confirmed = await confirmation.awaitConfirmation();
						if (confirmed.length >= match.captains.size) {
							await match.setMvp(target.id);
							await refreshDashboard();
							await interaction.channel
								?.send({
									content: t('events:match_control.mvp_set_to', {
										target: target.toString(),
									}),
								})
								.catch(() => {
									// Nothing
								});
						}
					}
				} catch {
					await confirmationCanceled();
				} finally {
					this.removeCacheFor(interaction.channelId);
				}
			});

			collector.on('end', (_, reason) => {
				if (reason !== 'selected') {
					this.removeCacheFor(interaction.channelId);
				}
			});
		} else if (customId === 'set_winner') {
			if (!match.isCaptain(interaction.user.id) && !interaction.memberPermissions.has('Administrator')) {
				await interaction.reply({
					content: t('events:match_control.errors.no_permission'),
					ephemeral: true,
				});
				return;
			}

			this.actionsCache.push(interaction.channelId);
			await interaction.deferUpdate();

			const selectTeamMenu = new SelectMenuComponent()
				.setCustomId('select_team')
				.setPlaceholder(t('events:match_control.select_menus.team_winner.placeholder'))
				.setMaxValues(1)
				.setOptions(
					{
						label: t('events:match_control.select_menus.team_winner.options.team_blue.label'),
						description: t('events:match_control.select_menus.team_winner.options.team_blue.description'),
						value: 'team_blue',
						emoji: {
							id: EmojisIds.TeamBlue,
						},
					},
					{
						label: t('events:match_control.select_menus.team_winner.options.team_red.label'),
						description: t('events:match_control.select_menus.team_winner.options.team_red.description'),
						value: 'team_red',
						emoji: {
							id: EmojisIds.TeamRed,
						},
					}
				);

			const reply = await interaction.channel?.send({
				content: t('events:match_control.select_team_winner'),
				components: [new ActionRow().addComponents(selectTeamMenu)],
			});

			try {
				const collected = await reply.awaitMessageComponent({
					componentType: ComponentType.SelectMenu,
					filter: (i) => i.user.id === interaction.user.id,
					time: 60000,
				});

				await reply.delete().catch(() => {
					// Nothing
				});

				if (match.isCaptain(interaction.user.id)) {
					const confirmationEmbed = new YuneEmbed()
						.setColor('Default')
						.setTitle(t('events:match_control.embeds.confirmation_team_winner.title'))
						.setDescription(
							t('events:match_control.embeds.confirmation_team_winner.description', {
								team: collected.values[0],
							})
						);

					const confirmation = new ConfirmationEmbed({
						users: [...match.captains.values()].map((x) => x.user),
						embed: confirmationEmbed,
						t,
						target: interaction.channel,
					});

					await confirmation.awaitConfirmation();
				}

				await match.setTeamWinner(collected.values[0] === 'team_blue' ? TeamId.Blue : TeamId.Red);
				await refreshDashboard();
				await interaction.channel?.send({
					content: t('events:match_control.team_winner_set_to', {
						team_winner: collected.values[0],
					}),
				});
			} catch {
				reply.delete().catch(() => {
					// Nothing
				});

				await confirmationCanceled();
			} finally {
				this.removeCacheFor(interaction.channelId);
			}
		} else if (customId === 'finalize') {
			if (!match.isCaptain(interaction.user.id) && !interaction.memberPermissions.has('Administrator')) {
				await interaction.reply({
					content: t('events:match_control.errors.no_permission'),
					ephemeral: true,
				});
				return;
			}

			if (!match.mvpMember) {
				await interaction.reply({
					content: t('events:match_control.errors.no_mvp'),
					ephemeral: true,
				});
				return;
			}

			if (!match.teams.some((x) => x.win)) {
				await interaction.reply({
					content: t('events:match_control.errors.no_team_winner'),
					ephemeral: true,
				});
				return;
			}

			this.actionsCache.push(interaction.channelId);

			await interaction.deferUpdate();
			if (match.isCaptain(interaction.user.id)) {
				try {
					const confirmationEmbed = new YuneEmbed()
						.setColor('Default')
						.setTitle(t('events:match_control.embeds.confirmation_finalize.title'))
						.setDescription(t('events:match_control.embeds.confirmation_finalize.description'));

					const confirmation = new ConfirmationEmbed({
						users: match.captains.map((x) => x.user),
						embed: confirmationEmbed,
						t,
						target: interaction.channel,
					});

					await confirmation.awaitConfirmation();
				} catch {
					this.removeCacheFor(interaction.channelId);
					await confirmationCanceled();
					return;
				}

				const matchData = await interaction.client.database.matches.findOneAndPopulate(
					{
						guildId: interaction.guildId,
						status: MatchStatus.InGame,
						matchId: match.id,
					},
					{
						path: 'participants.member',
						select: 'mmr rank pdl wins loses',
					}
				);

				match.status = MatchStatus.Ended;
				await finalizeMatch({ client: interaction.client, matchData });

				const finalizedEmbed = new YuneEmbed()
					.setColor('Yellow')
					.setTitle(t('events:match_control.embeds.finalized.title'))
					.setDescription(t('events:match_control.embeds.finalized.description'));

				await match.channels?.chat
					?.send({
						content: '@here',
						embeds: [finalizedEmbed],
					})
					.catch(() => undefined);

				this.removeCacheFor(interaction.channelId);
				setTimeout(() => {
					match.deleteChannels();
				}, 10000);
			}
		}

		async function confirmationCanceled() {
			const confirmationCanceledEmbed = new YuneEmbed()
				.setColor('Red')
				.setTitle(t('events:match_control.embeds.confirmation_canceled.title'))
				.setDescription(t('events:match_control.embeds.confirmation_canceled.description'));

			return interaction.channel
				?.send({
					embeds: [confirmationCanceledEmbed],
				})
				.then((msg) => {
					setTimeout(() => {
						msg.delete().catch(() => undefined);
					}, 7000);
				})
				.catch(() => {
					// Nothing
				});
		}
	}

	async onChannelDelete(channel: Channel) {
		this.removeCacheFor(channel.id);
	}

	private removeCacheFor(channelId: string) {
		if (this.actionsCache.includes(channelId)) {
			this.actionsCache.splice(this.actionsCache.indexOf(channelId), 1);
		}
	}
}
