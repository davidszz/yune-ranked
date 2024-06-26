import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

export async function remove(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
	const roleId = interaction.options.getString('cargo').replace(/[<@&>]/g, '');

	const { subscriptionRoles } = await interaction.client.database.guilds.findOne(
		interaction.guildId,
		'subscriptionRoles'
	);
	if (!subscriptionRoles?.includes(roleId)) {
		await interaction.editReply({
			content: t('subscription_roles.remove.errors.invalid_role'),
		});
		return;
	}

	await interaction.client.database.guilds.update(interaction.guildId, {
		$pull: {
			subscriptionRoles: roleId,
		},
	});

	const role = interaction.guild.roles.cache.get(roleId);
	await interaction.editReply({
		content: t('subscription_roles.remove.removed', {
			context: role ? 'valid_role' : null,
			role: role.toString(),
		}),
	});
}
