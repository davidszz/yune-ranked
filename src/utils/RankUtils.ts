import { MemberRank, BaseRankMMR } from './Constants';

interface PDLCalculatorOptions {
	mmr: number;
	rank: MemberRank;
	division: number;
	mvp?: boolean;
}

interface MemberRankResult {
	rank: string | MemberRank;
	division: number;
}

export class RankUtils {
	static calculateWonPdlAmount(options: PDLCalculatorOptions) {
		const currentRankBaseMMR = BaseRankMMR[options.rank] + options.division * 100;
		return Math.floor((options.mmr / currentRankBaseMMR) * 15 * (options.mvp ? 1.2 : 1));
	}

	static calculateLosePdlAmount(options: PDLCalculatorOptions) {
		return Math.max(30 - this.calculateWonPdlAmount(options), 5);
	}

	static getRankByMmr(mmr: number): MemberRankResult {
		const rank = Object.entries(BaseRankMMR)
			.sort((a, b) => a[1] - b[1])
			.reduce((acc, val) => (val[1] <= mmr ? val : acc));

		const division = Math.ceil((mmr - rank[1]) / 100) || 1;
		return {
			rank: rank[0],
			division,
		};
	}
}
