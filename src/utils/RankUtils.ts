import { Ranks } from './Ranks';
import { UserRank } from './UserRank';

interface PDLCalculatorOptions {
	mmr: number;
	matchMmr: number;
	mvp?: boolean;
}

export class RankUtils {
	static calculateWonPdlAmount(options: PDLCalculatorOptions) {
		const wonPdl = Math.min(options.mmr / options.matchMmr, 1.8) * 15 * (options.mvp ? 1.2 : 1);
		return wonPdl > 0 ? Math.floor(wonPdl) : 5;
	}

	static calculateLosePdlAmount(options: PDLCalculatorOptions) {
		const losePdl = Math.min(Math.min(options.matchMmr / options.mmr, 1.8) * 15 * (options.mvp ? 1.2 : 1), 24);
		return Math.floor(30 - losePdl);
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
		return rank.id === UserRank.Unranked ? UserRank.Iron1 : rank.id;
	}
}
