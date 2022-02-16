import 'discord.js';
import type { Yune } from '@client';

declare module 'discord.js' {
	interface Interaction {
		client: Yune;
	}

	interface Guild {
		client: Yune;
	}

	interface User {
		client: Yune;
	}

	interface BaseCommandInteraction {
		deferReply(options: InteractionDeferReplyOptions & { fetchReply: true }): Promise<Message>;
		member: GuildMember;
	}

	interface CommandInteractionOptionResolver {
		getMember(name: string, required?: boolean): GuildMember;
	}
}
