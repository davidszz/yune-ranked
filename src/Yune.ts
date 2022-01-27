import { Client, ClientOptions } from 'discord.js';

import type { DBWrapper } from '@database/DBWrapper';

interface YuneOptions extends ClientOptions {
	token: string;
	database: DBWrapper;
}

export class Yune extends Client {
	database: DBWrapper;

	constructor(options: YuneOptions) {
		super(options);
		this.token = options.token;
		this.database = options.database;
	}

	async start() {
		await this.login(this.token);
	}
}
