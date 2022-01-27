import type { Yune } from '@client';
import { Logger } from '@services/Logger';
import { EventListener } from '@structures/EventListener';

export default class MainListener extends EventListener {
	constructor(client: Yune) {
		super(client, {
			events: ['ready'],
		});
	}

	async onReady() {
		Logger.custom({ name: 'YUNE', options: ['magenta', 'bold'] }, `Logged in as ${this.client.user.tag}!`);
	}
}
