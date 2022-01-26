import { Client, ClientOptions } from 'discord.js';

interface YuneOptions extends ClientOptions {
	token: string;
}

export class Yune extends Client {
	constructor(options: YuneOptions) {
		super(options);
		this.token = options.token;
	}

	async start() {
		await this.login(this.token);
	}
}
