import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { YuneEmbed } from '@structures/YuneEmbed';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'assinatura',
			description: 'Obtem informações sobre a assinatura do usuário',
			usage: '[usuário]',
			options: [
				{
					name: 'usuario',
					description: '@menção ou ID do usuário',
					type: ApplicationCommandOptionType.User,
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply({ ephemeral: true });

		const target = interaction.options.getMember('usuario') ?? interaction.member;

		if (target.user.bot) {
			await interaction.editReply({
				content: t('common.errors.cannot_be_a_bot'),
			});
			return;
		}

		const targetData = await interaction.client.database.members.findOne(
			target,
			'subscribed subscribedAt subscriptionEndsAt subscriptionCreatedBy'
		);
		if (!targetData?.subscribed) {
			await interaction.editReply({
				content: t('common.errors.not_subscribed'),
			});
			return;
		}

		const embed = new YuneEmbed()
			.setTitle(
				t('subscription.embed.title', {
					context: interaction.user.id === target.id ? 'yourself' : null,
					target: target.user.tag,
				})
			)
			.setDescription(
				t('subscription.embed.description', {
					started_at: Math.floor(targetData.subscribedAt.getTime() / 1000),
					ends_at: Math.floor(targetData.subscriptionEndsAt.getTime() / 1000),
					created_by: `<@!${targetData.subscriptionCreatedBy}>`,
				})
			);

		await interaction.editReply({
			embeds: [embed],
		});
	}
}
