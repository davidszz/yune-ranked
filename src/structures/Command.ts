import {
	Interaction,
	AutocompleteInteraction,
	ApplicationCommandData,
	ApplicationCommandOptionData,
	PermissionFlags,
	ChatInputApplicationCommandData,
	ApplicationCommandType,
} from 'discord.js';
import type { TFunction } from 'i18next';

import type { Yune } from '@client';

type CommandData = ApplicationCommandData & {
	manageable?: boolean;
	permissions?: (keyof PermissionFlags)[];
	showInMatchHelp?: boolean;
	usage?: string;
	subscribersOnly?: boolean;
};

export interface Command {
	autocomplete?(interaction: AutocompleteInteraction, t: TFunction): void | Promise<void>;
}

export abstract class Command {
	name: string;
	type?: ApplicationCommandType;
	defaultPermission?: boolean;
	manageable: boolean;
	permissions?: (keyof PermissionFlags)[];
	showInMatchHelp: boolean;
	usage: string;
	subscribersOnly: boolean;

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
		this.usage = data.usage ?? '';
		this.subscribersOnly = !!data.subscribersOnly;

		if (!data.type || data.type === ApplicationCommandType.ChatInput) {
			this.description = (<ChatInputApplicationCommandData>data).description;
			this.options = (<ChatInputApplicationCommandData>data).options;
		}
	}

	get fullName() {
		return `${this.name} ${this.usage}`.trim();
	}
}
