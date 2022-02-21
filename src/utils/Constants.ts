export const Assets = {
	images: (path: string) => `src/assets/images/${path}`,
	font: (name: string, extension: 'otf' | 'ttf' | 'woff' | 'ttc' = 'ttf') => `src/assets/fonts/${name}.${extension}`,
};

export const CreateUrl = {
	message: (opts: { guildId: string; channelId: string; messageId: string }) =>
		`https://discord.com/channels/${opts.guildId}/${opts.channelId}/${opts.messageId}`,
	channel: (opts: { guildId: string; channelId: string }) =>
		`https://discord.com/channels/${opts.guildId}/${opts.channelId}`,
};

/* ------------------------------
-------- Misc Constants ---------
--------------------------------- */

export const DEFAULT_USER_MMR = 200;
export const DEFAULT_TEAM_SIZE = 10;

export const SURRENDER_VOTES_PERCENTAGE = 0.8;

export const RANK_ROLES_LIMIT = 10;

export const DEFAULT_NICKNAME_TEMPLATE = '#{rank} - {username}';
