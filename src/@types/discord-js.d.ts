import 'discord.js';
import type { Yune } from '@client';
import type { Match } from '@structures/Match';

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

	interface GuildChannel {
		client: Yune;
	}

	interface ClientEvents {
		matchEnded: [match: Match];
		matchCanceled: [match: Match, reason?: string];
		matchCreated: [match: Match];
	}

	interface CommandInteraction {
		deferReply(options: InteractionDeferReplyOptions & { fetchReply: true }): Promise<Message>;
		member: GuildMember;
	}

	interface CommandInteractionOptionResolver {
		getMember(name: string, required?: boolean): GuildMember;
	}
}
