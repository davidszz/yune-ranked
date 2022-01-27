import {
	Interaction,
	AutocompleteInteraction,
	ApplicationCommandData,
	ApplicationCommandOptionData,
	Constants,
} from 'discord.js';

import type { Yune } from '@client';

export interface Command {
	autocomplete?(interaction: AutocompleteInteraction): void | Promise<void>;
}

export abstract class Command {
	name: string;
	type?: ApplicationCommandData['type'];
	defaultPermission?: boolean;

	description?: string;
	options?: ApplicationCommandOptionData[];

	abstract run(interaction: Interaction): void | Promise<void>;

	constructor(public client: Yune, public data: ApplicationCommandData) {
		this.name = data.name;
		this.type = data.type;
		this.defaultPermission = data.defaultPermission;

		if (data.type === 'CHAT_INPUT' || data.type === Constants.ApplicationCommandTypes.CHAT_INPUT) {
			this.description = data.description;
			this.options = data.options;
		}
	}
}
