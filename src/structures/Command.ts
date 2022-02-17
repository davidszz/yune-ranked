import {
	Interaction,
	AutocompleteInteraction,
	ApplicationCommandData,
	ApplicationCommandOptionData,
	Constants,
	PermissionFlags,
} from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';

type CommandData = ApplicationCommandData & {
	manageable?: boolean;
	permissions?: (keyof PermissionFlags)[];
	showInMatchHelp?: boolean;
};

export interface Command {
	autocomplete?(interaction: AutocompleteInteraction, t: TFunction): void | Promise<void>;
}

export abstract class Command {
	name: string;
	type?: ApplicationCommandData['type'];
	defaultPermission?: boolean;
	manageable: boolean;
	permissions?: (keyof PermissionFlags)[];
	showInMatchHelp: boolean;

	description?: string;
	options?: ApplicationCommandOptionData[];

	abstract run(interaction: Interaction, t: TFunction): void | Promise<void>;

	constructor(public client: Yune, public data: CommandData) {
		this.name = data.name;
		this.type = data.type;
		this.defaultPermission = data.defaultPermission;
		this.manageable = data.manageable ?? true;
		this.showInMatchHelp = !!data.showInMatchHelp;
		this.permissions = data.permissions;

		if (data.type === 'CHAT_INPUT' || data.type === Constants.ApplicationCommandTypes.CHAT_INPUT) {
			this.description = data.description;
			this.options = data.options;
		}
	}
}
