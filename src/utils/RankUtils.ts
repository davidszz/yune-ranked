import { Ranks } from './Ranks';
import { UserRank } from './UserRank';

interface PDLCalculatorOptions {
	mmr: number;
	matchMmr: number;
	mvp?: boolean;
}

export class RankUtils {
	static calculateWonPdlAmount(options: PDLCalculatorOptions) {
		const wonPdl = Math.min(options.matchMmr / options.mmr, 1.8) * 26 * (options.mvp ? 1.2 : 1);
		return wonPdl > 0 ? Math.min(Math.floor(wonPdl), 50) : 12;
	}

	static calculateLosePdlAmount(options: PDLCalculatorOptions) {
		const losePdl = this.calculateWonPdlAmount(options);
		return Math.min(40 - losePdl, 8);
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
