import type { Interaction } from 'discord.js';
import i18next, { StringMap, TFunction, TOptions } from 'i18next';

import type { Yune } from '@client';
import { Logger } from '@services/Logger';
import { EventListener } from '@structures/EventListener';

export default class MainListener extends EventListener {
	constructor(client: Yune) {
		super(client, {
			events: ['ready', 'interactionCreate'],
		});
	}

	async onReady() {
		Logger.custom({ name: 'YUNE', options: ['magenta', 'bold'] }, `Logged in as ${this.client.user.tag}!`);
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
						await command.autocomplete(interaction);
					}
				} else {
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
