import { ApplicationCommandOptionType, ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';
import { Command } from '@structures/Command';
import { TimeUtils } from '@utils/TimeUtils';

export default class extends Command {
	constructor(client: Yune) {
		super(client, {
			name: 'resgatar',
			description: 'Resgate um código',
			usage: '<código>',
			options: [
				{
					name: 'codigo',
					description: 'Código de resgate',
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		});
	}

	async run(interaction: ChatInputCommandInteraction, t: TFunction) {
		await interaction.deferReply({ ephemeral: true });

		const code = interaction.options.getString('codigo');
		const subscriptionCode = await interaction.client.database.subscriptionCodes.findOne({ code });

		if (!subscriptionCode?._id) {
			interaction.editReply({
				content: t('redeem.errors.invalid_code'),
			});
			return;
		}

		await interaction.client.database.subscriptionCodes.deleteOne(subscriptionCode._id);

		const userData = await interaction.client.database.members.findOne(
			{
				guildId: interaction.guildId,
				userId: interaction.user.id,
			},
			'subscribed subscribedAt subscriptionEndsAt subscriptionCreatedBy'
		);

		const updateData = {
			subscribed: true,
			subscribedAt: userData.subscribed && userData.subscribedAt ? userData.subscribedAt : new Date(),
			subscriptionCreatedBy: subscriptionCode.createdBy,
			subscriptionEndsAt: new Date(
				(userData.subscribed && userData.subscriptionEndsAt > new Date()
					? userData.subscriptionEndsAt.getTime()
					: Date.now()) + subscriptionCode.duration
			),
		};

		await interaction.client.database.members.update(interaction.member, {
			$set: updateData,
		});

		const { subscriptionRoles } = await interaction.client.database.guilds.findOne(
			interaction.guildId,
			'subscriptionRoles'
		);
		if (subscriptionRoles?.length) {
			const toAdd = subscriptionRoles.filter(
				(x) => interaction.guild.roles.cache.has(x) && !interaction.member.roles.cache.has(x)
			);
			if (toAdd.length) {
				try {
					await interaction.member.roles.add(toAdd);
				} catch {
					// Nothing
				}
			}
		}

		const humanizedDuration = TimeUtils.humanizeDuration(subscriptionCode.duration);
		await interaction.editReply({
			content: t('redeem.redeemed', {
				duration: humanizedDuration,
				ends_at: updateData.subscriptionEndsAt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
			}),
		});

		interaction.channel.send({
			content: t('redeem.redeemed_broadcast', {
				user: interaction.user.toString(),
				duration: humanizedDuration,
			}),
		});
	}
}
