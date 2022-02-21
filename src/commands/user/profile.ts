import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { YuneEmbed } from '@structures/YuneEmbed';
import { Ranks } from '@utils/Ranks';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'perfil',
			description: 'Obtem o perfil do usuário',
			usage: '[usuário]',
			showInMatchHelp: true,
			options: [
				{
					name: 'usuário',
					description: '@menção ou ID do usuário',
					type: ApplicationCommandOptionType.User,
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply();

		const target = interaction.options.getMember('usuário') ?? interaction.member;
		const yourself = interaction.user.id === target.id;

		if (target.user.bot) {
			await interaction.editReply({
				content: t('common.errors.cannot_be_a_bot'),
			});
			return;
		}

		const data = await interaction.client.database.members.findOne(
			target,
			'pdl rank wins loses subscribed subscribedAt subscriptionEndsAt subscriptionCreatedBy'
		);
		if (!data.subscribed) {
			await interaction.editReply({
				content: t('common.errors.not_subscribed', { context: yourself ? 'yourself' : null }),
			});
			return;
		}

		const userRank = Ranks[data.rank];

		const profileEmbed = new YuneEmbed()
			.setTitle(t('profile.embed.title', { context: yourself ? 'yourself' : null, target: target.user.tag }))
			.setThumbnail(target.user.displayAvatarURL())
			.setDescription(
				t('profile.embed.description', {
					wins: data.wins,
					loses: data.loses,
					subscribed_at: data.subscribedAt,
					subscription_ends_in: data.subscriptionEndsAt,
					subscription_ends_at: data.subscriptionEndsAt,
					subscription_created_by: `<@!${data.subscriptionCreatedBy}>`,
					rank_name: t(`misc:ranks.${userRank.name}`, {
						context: userRank.division ? 'division' : null,
						division: userRank.division,
					}),
					pdl: data.pdl ?? 0,
				})
			);

		await interaction.editReply({
			embeds: [profileEmbed],
		});
	}
}
