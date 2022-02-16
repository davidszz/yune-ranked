import { Client, ClientOptions, Collection } from 'discord.js';

import type { DBWrapper } from '@database/DBWrapper';
import * as Loaders from '@loaders';
import type { Command } from '@structures/Command';

interface IQueueMember {
	id: string;
	messageId: string;
	channelId: string;
}

interface YuneOptions extends ClientOptions {
	token: string;
	guildId: string;
	database: DBWrapper;
}

export class Yune extends Client {
	guildId: string;
	database: DBWrapper;

	commands: Collection<string, Command>;
	queueMembers: IQueueMember[];

	constructor(options: YuneOptions) {
		super(options);
		this.token = options.token;
		this.guildId = options.guildId;
		this.database = options.database;
		this.commands = new Collection();
		this.queueMembers = [];
	}

	async start() {
		const loaders = Object.values(Loaders).map((L) => new L(this));

		// Initialize pre loaders
		await Promise.all(loaders.filter((l) => l.preLoad).map((l) => l.initialize()));

		await this.login(this.token);

		// Initialize post loaders
		await Promise.all(loaders.filter((l) => !l.preLoad).map((l) => l.initialize()));
	}

	get guild() {
		return this.guilds.cache.get(this.guildId);
	}
}
