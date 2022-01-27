import type { ClientEvents } from 'discord.js';

import type { Yune } from '@client';

interface EventListenerOptions {
	events: (keyof ClientEvents)[];
}

export abstract class EventListener {
	events: (keyof ClientEvents)[];

	constructor(public client: Yune, options: EventListenerOptions) {
		this.events = options.events;
	}
}
