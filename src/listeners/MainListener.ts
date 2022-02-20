import type { Interaction } from 'discord.js';
import i18next, { StringMap, TFunction, TOptions } from 'i18next';

import type { Yune } from '@client';
import { Logger } from '@services/Logger';
import { EventListener } from '@structures/EventListener';
import { DEFAULT_NICKNAME_TEMPLATE } from '@utils/Constants';

export default class MainListener extends EventListener {
	constructor(client: Yune) {
		super(client, {
			events: ['ready', 'interactionCreate'],
		});
	}

	async onReady() {
		Logger.custom({ name: 'YUNE', options: ['magenta', 'bold'] }, `Logged in as ${this.client.user.tag}!`);

		const { nicknameTemplate } = await this.client.database.guilds.findOne(this.client.guildId, 'nicknameTemplate');
		this.client.nicknameTemplate = nicknameTemplate ?? DEFAULT_NICKNAME_TEMPLATE;
	}

	async onInteractionCreate(interaction: Interaction) {
		if (!interaction.isCommand() && !interaction.isContextMenu() && !interaction.isAutocomplete()) {
			return;
		}

		if (!interaction.inCachedGuild()) {
			return;
		}

		const command = this.client.commands.get(interaction.commandName.toLowerCase());
		if (command) {
			const t = (key: string | string[], options?: TOptions<StringMap>) =>
				i18next.t(key, { ...options, lng: interaction.guildLocale ?? 'pt-BR' });

			try {
				if (interaction.isAutocomplete()) {
					if (command.autocomplete) {
						await command.autocomplete(interaction, t as TFunction);
					}
				} else {
					if (command.permissions?.length && !command.permissions.some((x) => interaction.memberPermissions.has(x))) {
						await interaction.reply({
							content: t('common.errors.need_permissions', {
								permissions: command.permissions.map((x) => `\`${x}\``).join(', '),
							}),
							ephemeral: true,
						});
						return;
					}

					if (command.subscribersOnly) {
						const { subscribed } = await interaction.client.database.members.findOne(interaction.member, 'subscribed');
						if (!subscribed) {
							await interaction.reply({
								content: t('common.errors.subscribers_only'),
							});
							return;
						}
					}

					await command.run(interaction, t as TFunction);
				}
			} catch (err) {
				Logger.error(
					`<${interaction.guild.name}(${interaction.guild.id})> [${interaction.user.tag}(${interaction.user.id})] #${interaction.channel.name} /${interaction.commandName}:`,
					err
				);
			}
		}
	}
}
