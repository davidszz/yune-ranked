import { Channel, Interaction } from 'discord.js';

import type { Yune } from '@client';
import { tFunction } from '@functions/misc/tFunction';
import { ConfirmationEmbed } from '@structures/ConfirmationEmbed';
import { EventListener } from '@structures/EventListener';
import { YuneEmbed } from '@structures/YuneEmbed';

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
		if (!match) {
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

		const customId = interaction.values[0];
		if (customId === 'set_mvp') {
			this.actionsCache.push(interaction.channelId);

			await interaction.deferUpdate();
			await interaction.channel.send({
				content: t('events:match_control.provide_a_mvp', { user: interaction.user.toString() }),
			});

			const collector = interaction.channel.createMessageCollector({
				time: 60000,
				filter: (msg) => msg.author.id === interaction.user.id,
			});

			collector.on('collect', async (msg) => {
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
					confirmed: [interaction.user.id],
					replyTo: msg.id,
					t,
				});

				try {
					const confirmed = await confirmation.awaitConfirmation();
					if (confirmed.length >= match.captains.size) {
						await match.setMvp(target.id);
						await interaction.channel
							.send({
								content: t('events:match_control.mvp_set_to', {
									target: target.toString(),
								}),
							})
							.catch(() => {
								// Nothing
							});
					}
				} catch {
					const confirmationCanceledEmbed = new YuneEmbed()
						.setColor('Red')
						.setTitle(t('events:match_control.embeds.confirmation_canceled.title'))
						.setTitle(t('events:match_control.embeds.confirmation_canceled.description'));

					await interaction.channel
						.send({
							embeds: [confirmationCanceledEmbed],
						})
						.catch(() => {
							// Nothing
						});
				} finally {
					this.removeCacheFor(interaction.channelId);
				}
			});

			collector.on('end', (_, reason) => {
				if (reason !== 'selected') {
					this.removeCacheFor(interaction.channelId);
				}
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
