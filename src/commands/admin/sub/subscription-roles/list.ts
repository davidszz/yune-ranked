import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

import { YuneEmbed } from '@structures/YuneEmbed';

export async function list(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
	const { subscriptionRoles } = await interaction.client.database.guilds.findOne(
		interaction.guildId,
		'subscriptionRoles'
	);
	if (!subscriptionRoles?.length) {
		await interaction.editReply({
			content: t('subscription_roles.list.errors.empty'),
		});
		return;
	}

	const embed = new YuneEmbed().setTitle(t('subscription_roles.list.embed.title')).setDescription(
		t('subscription_roles.list.embed.description', {
			roles: subscriptionRoles.map((x) => interaction.guild.roles.cache.get(x)?.toString() ?? `\`${x}\``).join(' '),
		})
	);

	await interaction.editReply({
		embeds: [embed],
	});
}
