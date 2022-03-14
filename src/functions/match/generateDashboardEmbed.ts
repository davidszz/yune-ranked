import { GuildMember } from 'discord.js';
import type { TFunction } from 'i18next';

import { Match } from '@structures/Match';
import { YuneEmbed } from '@structures/YuneEmbed';
import { Emojis } from '@utils/Emojis';
import { TeamId } from '@utils/TeamId';

interface IGenerateDashboardEmbedOptions {
	t: TFunction;
	match: Match;
	teamSize: number;
}

export function generateDashboardEmbed({ t, match, teamSize }: IGenerateDashboardEmbedOptions) {
	const participants = [...match.participants.values()];

	const mapParticipants = (members: GuildMember[]) =>
		members.map((x, i) => `${x}${[0, teamSize].includes(i) ? ` ${Emojis.Captain}` : ''}`).join('\n');

	return new YuneEmbed()
		.setColor('Default')
		.setAuthor({
			name: t('create_queue.embeds.chat.author'),
			iconURL: match.client.user.displayAvatarURL(),
		})
		.setTitle(t('create_queue.embeds.chat.title', { match_id: match.id }))
		.setDescription(
			t('create_queue.embeds.chat.description', {
				mvp: match.mvpMember?.toString() ?? t('create_queue.embeds.chat.variables.not_defined'),
				team_winner: match.teams.some((x) => x.win)
					? t('create_queue.embeds.chat.variables.team', {
							context: match.teams.find((x) => x.win).id === TeamId.Red ? 'red' : 'blue',
					  })
					: t('create_queue.embeds.chat.variables.not_defined'),
			})
		)
		.addFields(
			{
				name: t('create_queue.embeds.chat.fields.team_blue'),
				value: mapParticipants([...participants.values()].slice(0, teamSize)),
				inline: true,
			},
			{
				name: t('create_queue.embeds.chat.fields.team_red'),
				value: mapParticipants(participants.slice(teamSize, teamSize * 2)),
				inline: true,
			}
		)
		.setFooter({
			text: t('create_queue.embeds.chat.footer'),
		});
}
