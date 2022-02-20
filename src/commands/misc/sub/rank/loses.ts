import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import { PaginatedEmbed } from '@structures/PaginatedEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';

export async function loses(interaction: CommandInteraction, t: TFunction): Promise<void> {
	const reply = await interaction.deferReply({ fetchReply: true });

	const members = await interaction.client.database.members
		.findMany(
			{
				guildId: interaction.guildId,
				subscribed: true,
			},
			'userId loses'
		)
		.then((result) => result?.sort((a, b) => b.loses - a.loses));

	if (!members.length) {
		interaction.editReply({
			content: t('rank.loses.errors.no_members'),
		});
		return;
	}

	const authorIndex = members.findIndex((x) => x.userId === interaction.user.id);

	const template = new YuneEmbed()
		.setTitle(t('rank.loses.embed.title'))
		.setDescription(t('rank.loses.embed.description').concat('\n'))
		.setFooter({
			text: t('rank.loses.embed.footer', { total: members.length }),
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

			return `${s.start}${t('rank.loses.embed.description_row', {
				rank: i + 1,
				user: `<@!${value.userId}>`,
				loses: value.loses ?? 0,
			})}${s.end}`;
		},
		finalizeEmbed(embed: YuneEmbed) {
			if (authorIndex > -1) {
				embed.addDescription(
					...[
						'',
						t('rank.loses.embed.description_user_rank', {
							rank: authorIndex + 1,
						}),
					]
				);
			}
			return embed;
		},
	});

	paginated.paginate();
}