import { Ranks, UserRank } from './Constants';

interface PDLCalculatorOptions {
	mmr: number;
	rank: UserRank;
	mvp?: boolean;
}

export class RankUtils {
	static calculateWonPdlAmount(options: PDLCalculatorOptions) {
		const rank = Ranks[options.rank];
		const currentRankBaseMMR = rank.mmr;
		return Math.floor((options.mmr / currentRankBaseMMR) * 15 * (options.mvp ? 1.2 : 1));
	}

	static calculateLosePdlAmount(options: PDLCalculatorOptions) {
		return Math.max(30 - this.calculateWonPdlAmount(options), 5);
	}

	static getRankByMmr(mmr: number) {
		const rank = Ranks.reduce((acc, val) => {
			if (val.mmr <= mmr) {
				if (val.mmr >= acc.mmr) {
					return val;
				}
			}
			return acc;
		});
		return rank.id;
	}
}
