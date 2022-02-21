import type { ChatInputCommandInteraction } from 'discord.js';
import type { TFunction } from 'i18next';

export async function add(interaction: ChatInputCommandInteraction, t: TFunction): Promise<void> {
	const role = interaction.options.getRole('cargo');
	if (role.managed || !role.position) {
		interaction.editReply({
			content: t('subscription_roles.add.errors.managed_role'),
		});
		return;
	}

	const { subscriptionRoles } = await interaction.client.database.guilds.findOne(
		interaction.guildId,
		'subscriptionRoles'
	);
	if (subscriptionRoles?.includes(role.id)) {
		interaction.editReply({
			content: t('subscription_roles.add.errors.already_has'),
		});
		return;
	}

	await interaction.client.database.guilds.update(interaction.guildId, {
		$addToSet: {
			subscriptionRoles: role.id,
		},
	});

	interaction.editReply({
		content: t('subscription_roles.add.added', {
			role: role.toString(),
		}),
	});
}
