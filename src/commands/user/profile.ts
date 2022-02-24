import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { ProfileTemplate } from '@structures/canvas/templates/ProfileTemplate';
import { Command } from '@structures/Command';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'perfil',
			description: 'Obtem o perfil do usuário',
			usage: '[usuário]',
			showInMatchHelp: true,
			subscribersOnly: true,
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
			'pdl rank wins loses mvps subscribed bannerUrl'
		);
		if (!data.subscribed) {
			await interaction.editReply({
				content: t('common.errors.not_subscribed', { context: yourself ? 'yourself' : null }),
			});
			return;
		}

		/* const myRank = await interaction.client.database.members.model.aggregate([
			{ $match: { guildId: interaction.guildId, subscribed: true } },
			{
				$setWindowFields: {
					partitionBy: null,
					sortBy: { rank: -1 },
					output: { userRank: { $rank: {} } },
				},
			},
			{ $match: { userId: target.id } },
			{ $project: { userRank: 1 } },
		]).then((res: [{ userRank: number }]) => res?.[0]?.userRank ?? 0); */

		const template = new ProfileTemplate(t, {
			data,
			user: target.user,
		});

		const buffer = await template.build();

		await interaction.editReply({
			content: t('profile.success', {
				context: yourself ? null : 'target',
				target: target.toString(),
			}),
			files: [
				{
					name: 'profile.png',
					attachment: buffer,
				},
			],
		});
	}
}
