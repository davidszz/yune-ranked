import 'discord.js';
import type { Yune } from '@client';

declare module 'discord.js' {
	interface Interaction {
		client: Yune;
	}

	interface BaseCommandInteraction {
		deferReply(options: InteractionDeferReplyOptions & { fetchReply: true }): Promise<Message>;
	}
}
