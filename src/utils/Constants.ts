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
