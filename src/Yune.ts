import { Client, ClientOptions, Collection } from 'discord.js';

import type { DBWrapper } from '@database/DBWrapper';
import * as Loaders from '@loaders';
import type { Command } from '@structures/Command';

import { MatchManager } from './managers/MatchManager';

interface IQueueMember {
	id: string;
	messageId: string;
	channelId: string;
}

interface INicknameQueue {
	userId: string;
	rank: number;
}

interface YuneOptions extends ClientOptions {
	token: string;
	guildId: string;
	database: DBWrapper;
}

export class Yune extends Client {
	guildId: string;
	database: DBWrapper;
	initialized: boolean;

	commands: Collection<string, Command>;
	queueMembers: IQueueMember[];
	nicknameQueue: INicknameQueue[];
	nicknameTemplate: string;
	matches: MatchManager;

	constructor(options: YuneOptions) {
		super(options);
		this.token = options.token;
		this.guildId = options.guildId;
		this.database = options.database;
		this.commands = new Collection();
		this.queueMembers = [];
		this.nicknameQueue = [];
		this.matches = new MatchManager(this);
		this.initialized = false;
	}

	async start() {
		const loaders = Object.values(Loaders).map((L) => new L(this));

		// Initialize pre loaders
		await Promise.all(loaders.filter((l) => l.preLoad).map((l) => l.initialize()));

		await this.login(this.token);

		// Initialize post loaders
		await Promise.all(loaders.filter((l) => !l.preLoad).map((l) => l.initialize()));

		// Fetch the main guild members
		if (this.guild) {
			await this.guild.members.fetch();
		}

		// Fetch all InGame matches
		await this.matches.fetch();

		this.initialized = true;
	}

	get guild() {
		return this.guilds.cache.get(this.guildId);
	}
}
