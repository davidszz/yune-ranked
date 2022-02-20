import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { PaginatedEmbed } from '@structures/PaginatedEmbed';
import { YuneEmbed } from '@structures/YuneEmbed';
import { TimeUtils } from '@utils/TimeUtils';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'codigos-assinatura',
			description: 'Obtem uma lista com os códigos de assinatura disponíveis',
			permissions: ['ADMINISTRATOR'],
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply({ ephemeral: true });

		const subscriptionCodes = await interaction.client.database.subscriptionCodes.findMany({
			guildId: interaction.guildId,
		});

		if (!subscriptionCodes.length) {
			interaction.editReply({
				content: t('subscription_codes.errors.empty'),
			});
			return;
		}

		const template = new YuneEmbed().setTitle(t('subscription_codes.embeds.template.title')).setFooter({
			text: t('subscription_codes.embeds.template.footer', { total: subscriptionCodes.length }),
			iconURL: interaction.client.user.displayAvatarURL({ format: 'png', dynamic: true }),
		});

		const paginated = new PaginatedEmbed({
			author: interaction.user,
			target: interaction,
			template,
			values: subscriptionCodes
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
				.map((x) => ({
					id: x._id,
					value: x,
				})),
			limit: 4,
			rollback: true,
			createRow({ value }) {
				return t('subscription_codes.embeds.template.description_row', {
					code: value.code,
					duration: TimeUtils.humanizeDuration(value.duration),
					created_at: value.createdAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
					created_by: `<@!${value.createdBy}>`,
				}).concat('\n');
			},
		});

		paginated.paginate();
	}
}