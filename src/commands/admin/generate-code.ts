import type { CommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import type { ISubscriptionCodeSchema } from '@database/schemas/SubscriptionCodeSchema';
import { Command } from '@structures/Command';
import { YuneEmbed } from '@structures/YuneEmbed';
import { TimeUtils } from '@utils/TimeUtils';
import { Utils } from '@utils/Utils';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'gerar-codigo',
			description: 'Gera um código de assinatura com a duração fornecida',
			usage: '<duração> [quantidade: 1]',
			permissions: ['ADMINISTRATOR'],
			options: [
				{
					name: 'duração',
					description: 'Duração da assinatura. Exemplo: 25 dias e 12 horas',
					type: 'STRING',
					required: true,
				},
				{
					name: 'quantidade',
					description: 'Quantidade de códigos a ser gerada. Padrão: 1',
					type: 'INTEGER',
					minValue: 1,
					maxValue: 20,
				},
			],
		});
	}

	async run(interaction: CommandInteraction, t: TFunction) {
		await interaction.deferReply({ ephemeral: true });

		const duration = interaction.options.getString('duração');
		const amount = interaction.options.getInteger('quantidade') ?? 1;

		const parsedDuration = TimeUtils.parseDuration(duration, 60000);
		if (parsedDuration < 60000) {
			interaction.editReply({
				content: t('generate_code.errors.invalid_duration'),
			});
			return;
		}

		const generateCodeData = () => {
			const randStr = Utils.randomStr({ length: 24 }).toUpperCase();
			const code = `${randStr.slice(0, 4)}-${randStr.slice(4, 8)}-${randStr.slice(8, 14)}-${randStr.slice(14)}`;
			return {
				guildId: interaction.guildId,
				code,
				duration: parsedDuration,
				createdAt: new Date(),
				createdBy: interaction.user.id,
			} as ISubscriptionCodeSchema;
		};

		const entities: ISubscriptionCodeSchema[] = [];
		while (entities.length < amount) {
			entities.push(generateCodeData());
		}

		await interaction.client.database.subscriptionCodes.create(entities);

		const count = entities.length;
		const embed = new YuneEmbed()
			.setTitle(t('generate_code.embed.title', { count }))
			.setDescription(t('generate_code.embed.description', { count, code: entities[0].code }))
			.addFields([
				{
					name: t('generate_code.embed.fields.code', { count }),
					value: entities.map((x) => `\`${x.code}\``).join('\n'),
					inline: true,
				},
				{
					name: t('generate_code.embed.fields.duration.name', { count }),
					value: t('generate_code.embed.fields.duration.value', {
						duration,
						duration_in_minutes: Math.round(parsedDuration / 60000),
					}),
					inline: true,
				},
			]);

		interaction.editReply({
			embeds: [embed],
		});
	}
}
