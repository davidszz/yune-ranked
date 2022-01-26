import { Client } from 'discord.js';

export class Yune extends Client {
	async start() {
		this.login();
	}
}
