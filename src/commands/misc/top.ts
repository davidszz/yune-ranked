import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { PaginatedEmbed } from '@structures/PaginatedEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';
import { Ranks, UserRank } from '@utils/Constants';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'top',
			description: 'Obtem uma lista com os top ranks do servidor.',
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		const reply = await interaction.deferReply({ fetchReply: true });

		const members = await interaction.client.database.members.findMany({
			guildId: interaction.guildId,
			subscribed: true,
		});

		if (members?.length) {
			interaction.editReply({
				content: t('top.errors.no_members'),
			});
			return;
		}

		const template = new YuneEmbed()
			.setTitle(t('top.embeds.template.title'))
			.setDescription(t('top.embeds.template.description'))
			.setFooter({
				text: t('top.embeds.template.footer', { total: members.length }),
				iconURL: interaction.client.user.displayAvatarURL({ format: 'png', dynamic: true }),
			});

		const paginated = new PaginatedEmbed({
			author: interaction.user,
			target: interaction,
			template,
			values: members.map((x) => ({
				id: x._id,
				value: x,
			})),
			createRow({ value }, i) {
				const s =
					value.userId === interaction.user.id
						? {
								start: '[',
								end: `](${reply.url})`,
						  }
						: { start: '', end: '' };

				const userRank = Ranks[value.rank];

				return `${s.start}${t('top.embeds.template.description_row', {
					rank: i + 1,
					rank_name: t(`misc:ranks.${userRank.name}`, {
						context: userRank.division ? 'division' : null,
						division: userRank.division,
					}),
					user: `<@!${value.userId}>`,
					pdl: value.pdl ?? 0,
					wins: value.wins ?? 0,
				})}${s.end}`;
			},
		});

		paginated.paginate();
	}
}