import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'remover-assinatura',
			description: 'Remove a assinatura atual de um usuário',
			usage: '[usuário]',
			permissions: ['Administrator'],
			options: [
				{
					name: 'usuario',
					description: '@menção ou ID do usuário',
					type: ApplicationCommandOptionType.User,
					required: true,
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply();

		const target = interaction.options.getMember('usuario');
		if (!target?.user) {
			interaction.editReply({
				content: t('common.errors.invalid_member'),
			});
			return;
		}

		if (target.user.bot) {
			interaction.editReply({
				content: t('common.errors.cannot_be_a_bot'),
			});
			return;
		}

		const { subscribed } = await interaction.client.database.members.findOne(target, 'subscribed');
		if (!subscribed) {
			interaction.editReply({
				content: t('remove_subscription.errors.not_subscribed'),
			});
			return;
		}

		await interaction.client.database.members.update(target, {
			$unset: {
				subscribed: false,
				subscribedAt: 0,
				subscriptionCreatedBy: '',
				subscriptionEndsAt: 0,
			},
		});

		interaction.editReply({
			content: t('remove_subscription.removed', {
				target: target.toString(),
			}),
		});
	}
}
