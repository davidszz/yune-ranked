import type { GuildChannel, TextBasedChannel } from 'discord.js';
import i18next, { StringMap, TOptions } from 'i18next';

import { Yune } from '@client';
import { EventListener } from '@structures/EventListener';
import { YuneEmbed } from '@structures/YuneEmbed';
import { MatchStatus } from '@utils/MatchStatus';

export default class MatchListener extends EventListener {
	constructor(client: Yune) {
		super(client, {
			events: ['channelDelete'],
		});
	}

	async onChannelDelete(channel: GuildChannel) {
		if (channel.guildId !== channel.client.guildId) {
			return;
		}

		const { client, guild } = channel;

		const matchData = await client.database.matches.findOne(
			{
				status: MatchStatus.InGame,
				guildId: channel.guildId,
				$or: [
					{ 'channels.chat': channel.id },
					{ 'channels.category': channel.id },
					{ 'channels.redVoice': channel.id },
					{ 'channels.blueVoice': channel.id },
				],
			},
			'_id matchId queueChannelId createdAt participants.userId channels'
		);

		if (matchData?._id) {
			await client.database.matches.deleteOne(matchData._id);

			const remainingChannels = Object.values(matchData.channels)
				.map((x) => guild.channels.cache.get(x))
				.filter(Boolean);

			if (remainingChannels.length) {
				for (const channel of remainingChannels) {
					try {
						await channel.delete();
					} catch {
						// Nothing
					}
				}
			}

			const queueChannel = guild.channels.cache.get(matchData.queueChannelId) as TextBasedChannel;
			if (queueChannel) {
				const t = (key: string | string[], options?: TOptions<StringMap>) =>
					i18next.t(key, { ...options, lng: guild.preferredLocale ?? 'pt-BR' });

				const matchOwner = guild.members.cache.get(matchData.participants[0].userId);
				const deletedEmbed = new YuneEmbed()
					.setColor('Red')
					.setAuthor({
						name: t('create_queue.embeds.deleted.author', {
							match_id: matchData.matchId,
						}),
						iconURL: client.user.displayAvatarURL(),
					})
					.setDescription(t('create_queue.embeds.deleted.description'))
					.addFields(
						{
							name: t('create_queue.embeds.deleted.fields.started_at.name'),
							value: t('create_queue.embeds.deleted.fields.started_at.value', {
								created_at: matchData.createdAt,
							}),
							inline: true,
						},
						{
							name: t('create_queue.embeds.deleted.fields.created_by'),
							value: matchOwner
								? `**${matchOwner.user.tag}** (${matchOwner.id})`
								: `<@!${matchData.participants[0].userId}>`,
							inline: true,
						}
					)
					.setTimestamp();

				queueChannel.send({
					embeds: [deletedEmbed],
				});
			}
		}
	}
}
