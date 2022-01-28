import { MemberRank, RankMMR } from './Constants';

interface PDLCalculatorOptions {
	mmr: number;
	rank: MemberRank;
	division: number;
	mvp?: boolean;
}

export class RankUtils {
	static calculateWonPdlAmount(options: PDLCalculatorOptions) {
		const currentRankBaseMMR = RankMMR[options.rank] + options.division * 100;
		return Math.floor((options.mmr / currentRankBaseMMR) * 15 * (options.mvp ? 1.2 : 1));
	}

	static calculateLosePdlAmount(options: PDLCalculatorOptions) {
		return Math.max(30 - this.calculateWonPdlAmount(options), 5);
	}
}
