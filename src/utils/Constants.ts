export enum MatchStatus {
	Ended,
	InGame,
}

export enum TeamID {
	Blue = 1,
	Red,
}

export enum UserRank {
	Unranked,
	Iron1,
	Iron2,
	Iron3,
	Bronze1,
	Bronze2,
	Bronze3,
	Silver1,
	Silver2,
	Silver3,
	Gold1,
	Gold2,
	Gold3,
	Platinum1,
	Platinum2,
	Platinum3,
	Diamond1,
	Diamond2,
	Diamond3,
	Master1,
	Master2,
	Master3,
	GrandMaster,
	Challenger,
}

export const Assets = {
	images: (path: string) => `src/assets/images/${path}`,
	font: (name: string, extension: 'otf' | 'ttf' | 'woff' | 'ttc' = 'ttf') => `src/assets/fonts/${name}.${extension}`,
};

export const Emojis = {
	UNRANKED: '<:unranked:936795758710095902>',
	IRON: '<:iron:936795758693335050>',
	BRONZE: '<:bronze:936795758617821194>',
	SILVER: '<:silver:936795758680760350>',
	GOLD: '<:gold:936795758378770494>',
	PLATINUM: '<:platinum:936795758672351262>',
	DIAMOND: '<:diamond:936795758731071598>',
	MASTER: '<:master:936795758802374657>',
	GRAND_MASTER: '<:grand_master:936795758647197716>',
	CHALLENGER: '<:challenger:936795758668169226>',
	EMPTY_USER: '<:empty_user:936917351918604298>',
	ACCEPTED_USER: '<:accepted_user:936917351918628914>',
	JOIN: '<:join:936935440307613716>',
	LEFT: '<:left:936935440257269770>',
	TOGGLE_ON: '<:toggle_on:937221783604584458>',
	TOGGLE_OFF: '<:toggle_off:937221783604563988>',
	CROWN: '<:icrown:943643271299735602>',
	TEAM_BLUE: '<:team_blue:944303523171016705>',
	TEAM_RED: '<:team_red:944303523267493938>',
	COPY: '<:copy_paste:945130219730255922>',
	INFO: '<:info:945132548609155132>',
	INFO_IN: '<:info_in:945387615287377950>',
	INFO_FO: '<:info_fo:945387615190921226>',
};

export const EmojisIds = Object.fromEntries(
	Object.entries(Emojis).map((x) => [x[0], x[1].replace(/<(a)?:.*:(\d+)>/gi, '$2')])
) as Record<keyof typeof Emojis, string>;

export const Ranks = [
	{
		id: UserRank.Unranked,
		name: 'unranked',
		mmr: 0,
		maxPdl: 0,
		assets: {
			badge: Assets.images('ranks/badges/unranked.png'),
		},
	},
	{
		id: UserRank.Iron1,
		name: 'iron',
		division: 1,
		mmr: 200,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/iron.png'),
		},
	},
	{
		id: UserRank.Iron2,
		name: 'iron',
		division: 2,
		mmr: 300,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/iron.png'),
		},
	},
	{
		id: UserRank.Iron3,
		name: 'iron',
		division: 3,
		mmr: 400,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/iron.png'),
		},
	},
	{
		id: UserRank.Bronze1,
		name: 'bronze',
		division: 1,
		mmr: 500,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/bronze.png'),
		},
	},
	{
		id: UserRank.Bronze2,
		name: 'bronze',
		division: 2,
		mmr: 600,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/bronze.png'),
		},
	},
	{
		id: UserRank.Bronze3,
		name: 'bronze',
		division: 3,
		mmr: 700,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/bronze.png'),
		},
	},
	{
		id: UserRank.Silver1,
		name: 'silver',
		division: 1,
		mmr: 800,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/silver.png'),
		},
	},
	{
		id: UserRank.Silver2,
		name: 'silver',
		division: 2,
		mmr: 900,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/silver.png'),
		},
	},
	{
		id: UserRank.Silver3,
		name: 'silver',
		division: 3,
		mmr: 1000,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/silver.png'),
		},
	},
	{
		id: UserRank.Gold1,
		name: 'gold',
		division: 1,
		mmr: 1100,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/gold.png'),
		},
	},
	{
		id: UserRank.Gold2,
		name: 'gold',
		division: 2,
		mmr: 1200,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/gold.png'),
		},
	},
	{
		id: UserRank.Gold3,
		name: 'gold',
		division: 3,
		mmr: 1300,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/gold.png'),
		},
	},
	{
		id: UserRank.Platinum1,
		name: 'platinum',
		division: 1,
		mmr: 1400,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/platinum.png'),
		},
	},
	{
		id: UserRank.Platinum2,
		name: 'platinum',
		division: 2,
		mmr: 1500,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/platinum.png'),
		},
	},
	{
		id: UserRank.Platinum3,
		name: 'platinum',
		division: 3,
		mmr: 1600,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/platinum.png'),
		},
	},
	{
		id: UserRank.Diamond1,
		name: 'diamond',
		division: 1,
		mmr: 1700,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/diamond.png'),
		},
	},
	{
		id: UserRank.Diamond2,
		name: 'diamond',
		division: 2,
		mmr: 1800,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/diamond.png'),
		},
	},
	{
		id: UserRank.Diamond3,
		name: 'diamond',
		division: 3,
		mmr: 1900,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/diamond.png'),
		},
	},
	{
		id: UserRank.Master1,
		name: 'master',
		division: 1,
		mmr: 2000,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/master.png'),
		},
	},
	{
		id: UserRank.Master2,
		name: 'master',
		division: 2,
		mmr: 2100,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/master.png'),
		},
	},
	{
		id: UserRank.Master3,
		name: 'master',
		division: 3,
		mmr: 2200,
		maxPdl: 100,
		assets: {
			badge: Assets.images('ranks/badges/master.png'),
		},
	},
	{
		id: UserRank.GrandMaster,
		name: 'grand_master',
		mmr: 2300,
		maxPdl: 400,
		assets: {
			badge: Assets.images('ranks/badges/grand_master.png'),
		},
	},
	{
		id: UserRank.Challenger,
		name: 'challenger',
		mmr: 2800,
		maxPdl: 3000,
		assets: {
			badge: Assets.images('ranks/badges/challenger.png'),
		},
	},
];

export const Images = {
	icons: {
		tip: 'https://i.imgur.com/YbUBcN7.png',
	},
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

export const DEFAULT_USER_MMR = Ranks[UserRank.Iron1].mmr;
export const DEFAULT_TEAM_SIZE = 10;

export const SURRENDER_VOTES_PERCENTAGE = 0.8;

export const RANK_ROLES_LIMIT = 10;

export const DEFAULT_NICKNAME_TEMPLATE = '#{rank} - {username}';
