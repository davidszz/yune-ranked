import type { GuildChannel } from 'discord.js';

import { Yune } from '@client';
import { tFunction } from '@functions/misc/t-function';
import { EventListener } from '@structures/EventListener';
import type { Match } from '@structures/Match';
import { YuneEmbed } from '@structures/YuneEmbed';

export default class MatchListener extends EventListener {
	constructor(client: Yune) {
		super(client, {
			events: ['channelDelete', 'matchCanceled'],
		});
	}

	async onChannelDelete(channel: GuildChannel) {
		if (!this.client.initialized) {
			return;
		}

		if (channel.guildId !== channel.client.guildId) {
			return;
		}

		const match = this.client.matches.cache.find((x) => x.channelIds.some((x) => x === channel.id));
		if (!match) {
			return;
		}

		await match.delete();
		this.client.emit('matchCanceled', match, 'deleted');
		await match.deleteChannels();
	}

	async onMatchCanceled(match: Match, reason: string) {
		const t = tFunction(match.guild.preferredLocale ?? 'pt-BR');

		if (match.queueChannel) {
			if (reason === 'deleted') {
				const embed = new YuneEmbed()
					.setColor('Red')
					.setAuthor({
						name: t('create_queue.embeds.deleted.author', {
							match_id: match.id,
						}),
						iconURL: match.client.user.displayAvatarURL(),
					})
					.setDescription(t('create_queue.embeds.deleted.description'))
					.addFields(
						{
							name: t('create_queue.embeds.deleted.fields.started_at.name'),
							value: t('create_queue.embeds.deleted.fields.started_at.value', {
								created_at: match.createdAt,
							}),
							inline: true,
						},
						{
							name: t('create_queue.embeds.deleted.fields.created_by'),
							value: match.owner ? `**${match.owner.user.tag}** (${match.ownerId})` : `<@!${match.ownerId}>`,
							inline: true,
						}
					)
					.setTimestamp();

				await match.queueChannel.send({
					embeds: [embed],
				});
			}
		}
	}
}
