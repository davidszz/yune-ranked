import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'deletar-codigo',
			description: 'Deleta um código de assinatura permanentemente',
			usage: '<código>',
			permissions: ['Administrator'],
			options: [
				{
					name: 'codigo',
					description: 'O código da assinatura que deseja deletar',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply({ ephemeral: true });

		const code = interaction.options.getString('codigo');
		const subscriptionCode = await interaction.client.database.subscriptionCodes.findOne({ code }, '_id');

		if (!subscriptionCode?._id) {
			interaction.editReply({
				content: t('delete_code.errors.invalid_code'),
			});
			return;
		}

		await interaction.client.database.subscriptionCodes.deleteOne(subscriptionCode._id);

		interaction.editReply({
			content: t('delete_code.deleted', { code }),
		});
	}
}
