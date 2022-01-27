import type { Interaction } from 'discord.js';

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
			try {
				if (interaction.isAutocomplete()) {
					if (command.autocomplete) {
						await command.autocomplete(interaction);
					}
				} else {
					await command.run(interaction);
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
