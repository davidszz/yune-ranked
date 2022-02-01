export enum MatchStatus {
	ENDED,
	IN_GAME,
}

export enum MemberRank {
	IRON = 'iron',
	BRONZE = 'bronze',
	SILVER = 'silver',
	GOLD = 'gold',
	PLATINUM = 'platinum',
	DIAMOND = 'diamond',
	MASTER = 'master',
	GRAND_MASTER = 'grand_master',
	CHALLENGER = 'challenger',
}

export const BaseRankMMR = {
	iron: 200,
	bronze: 500,
	silver: 800,
	gold: 1100,
	platinum: 1400,
	diamond: 1700,
	master: 2000,
	grand_master: 2300,
	challenger: 2600,
};

export const Emojis = {
	unranked: '<:unranked:936795758710095902>',
	iron: '<:iron:936795758693335050>',
	bronze: '<:bronze:936795758617821194>',
	silver: '<:silver:936795758680760350>',
	gold: '<:gold:936795758378770494>',
	platinum: '<:platinum:936795758672351262>',
	diamond: '<:diamond:936795758731071598>',
	master: '<:master:936795758802374657>',
	grand_master: '<:grand_master:936795758647197716>',
	challenger: '<:challenger:936795758668169226>',
	empty_user: '<:empty_user:936917351918604298>',
	accepted_user: '<:accepted_user:936917351918628914>',
	join: '<:join:936935440307613716>',
	left: '<:left:936935440257269770>',
	toggle_on: '<:toggle_on:937221783604584458>',
	toggle_off: '<:toggle_off:937221783604563988>',
};

export const Assets = {
	images: (path: string) => `src/assets/images/${path}`,
	font: (name: string, extension: 'otf' | 'ttf' | 'woff' | 'ttc' = 'ttf') => `src/assets/fonts/${name}.${extension}`,
};

export const Images = {
	icons: {
		tip: 'https://i.imgur.com/YbUBcN7.png',
	},
};

export const RankAssets = {
	unranked: {
		badge: Assets.images('ranks/badges/unranked.png'),
	},
	iron: {
		badge: Assets.images('ranks/badges/iron.png'),
	},
	bronze: {
		badge: Assets.images('ranks/badges/bronze.png'),
	},
	silver: {
		badge: Assets.images('ranks/badges/silver.png'),
	},
	gold: {
		badge: Assets.images('ranks/badges/gold.png'),
	},
	platinum: {
		badge: Assets.images('ranks/badges/platinum.png'),
	},
	diamond: {
		badge: Assets.images('ranks/badges/diamond.png'),
	},
	master: {
		badge: Assets.images('ranks/badges/master.png'),
	},
	grand_master: {
		badge: Assets.images('ranks/badges/grand_master.png'),
	},
	challenger: {
		badge: Assets.images('ranks/badges/challenger.png'),
	},
};

/* ------------------------------
-------- Misc Constants ---------
--------------------------------- */

export const DEFAULT_USER_MMR = BaseRankMMR.iron;
export const DEFAULT_TEAM_SIZE = 10;
