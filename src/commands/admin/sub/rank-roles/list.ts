import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import { PaginatedEmbed } from '@structures/PaginatedEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';
import { Ranks } from '@utils/Constants';

export async function list(interaction: CommandInteraction, t: TFunction): Promise<void> {
	const { rankRoles } = await interaction.client.database.guilds.findOne(interaction.guildId, 'rankRoles');

	const validRankRoles = rankRoles.filter(
		(x) => x.roles?.filter((roleId) => interaction.guild.roles.cache.has(roleId)).length
	);
	if (!validRankRoles.length) {
		interaction.editReply({
			content: t('rank_roles.list.errors.no_roles'),
		});
		return;
	}

	const values = rankRoles
		.sort((a, b) => {
			const rr = (name: string) => Ranks.find((x) => x.name === name).id;
			return rr(a.rank) - rr(b.rank);
		})
		.map((x) => ({
			id: x.rank,
			value: {
				rankName: t(`misc:ranks.${x.rank}`),
				roles: x.roles.map((x) => `<@&${x}>`),
			},
		}));

	const template = new YuneEmbed().setTitle(t('rank_roles.list.embeds.template.title')).setFooter({
		text: t('rank_roles.list.embeds.template.footer', {
			total_ranks: validRankRoles.length,
			total_roles: validRankRoles.reduce((acc, val) => acc + (val.roles?.length ?? 0), 0),
		}),
	});

	const paginated = new PaginatedEmbed({
		author: interaction.user,
		target: interaction,
		values,
		template,
		limit: 5,
		createRow({ value }) {
			return t('rank_roles.list.embeds.template.description.row', {
				rank_name: value.rankName,
				roles: value.roles.join(' '),
			}).concat('\n');
		},
	});

	paginated.paginate();
}
