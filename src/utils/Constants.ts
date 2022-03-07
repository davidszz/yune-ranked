export const CdnBaseUrl = 'https://cdn.discordapp.com/';

export const Assets = {
	images: (path: string) => `src/assets/images/${path}`,
	font: (name: string, extension: 'otf' | 'ttf' | 'woff' | 'ttc' = 'ttf') => `src/assets/fonts/${name}.${extension}`,
};

export const CreateUrl = {
	message: (opts: { guildId: string; channelId: string; messageId: string }) =>
		`https://discord.com/channels/${opts.guildId}/${opts.channelId}/${opts.messageId}`,
	channel: (opts: { guildId: string; channelId: string }) =>
		`https://discord.com/channels/${opts.guildId}/${opts.channelId}`,
	avatar: (options: {
		userId: string;
		hash: string;
		dynamic: boolean;
		format: 'png' | 'jpeg' | 'jpg' | 'webp';
		size: 16 | 32 | 56 | 64 | 96 | 128 | 256 | 300 | 512 | 600 | 1024 | 2048;
	}) =>
		`${CdnBaseUrl}/avatars/${options.userId}/${options.hash}.${
			options.dynamic && options.hash.startsWith('a_') ? 'gif' : options.format
		}${options.size ? `?size=${options.size}` : ''}`,
	guildIcon: (options: {
		guildId: string;
		hash: string;
		dynamic: boolean;
		format: 'png' | 'jpeg' | 'jpg' | 'webp';
		size: 16 | 32 | 56 | 64 | 96 | 128 | 256 | 300 | 512 | 600 | 1024 | 2048;
	}) =>
		`${CdnBaseUrl}/icons/${options.guildId}/${options.hash}.${
			options.dynamic && options.hash.startsWith('a_') ? 'gif' : options.format
		}${options.size ? `?size=${options.size}` : ''}`,
};

/* ------------------------------
-------- Misc Constants ---------
--------------------------------- */

export const DEFAULT_USER_MMR = 200;
export const DEFAULT_TEAM_SIZE = 10;

export const SURRENDER_VOTES_PERCENTAGE = 0.8;

export const RANK_ROLES_LIMIT = 10;

export const DEFAULT_NICKNAME_TEMPLATE = '#{rank} - {username}';
