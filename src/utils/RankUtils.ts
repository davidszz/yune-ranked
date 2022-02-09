import { Rank, RankType, BaseRankMMR } from './Constants';

interface PDLCalculatorOptions {
	mmr: number;
	rank: RankType | keyof typeof Rank;
	division: number;
	mvp?: boolean;
}

interface MemberRankResult {
	rank: typeof Rank[keyof typeof Rank];
	division: number;
}

export class RankUtils {
	static calculateWonPdlAmount(options: PDLCalculatorOptions) {
		const rankKey =
			typeof options.rank === 'string'
				? options.rank
				: <keyof typeof Rank>Object.keys(Rank)[Object.values(Rank).findIndex((x) => x.id === options.rank)];

		const currentRankBaseMMR = BaseRankMMR[rankKey] + options.division * 100;
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
			rank: Rank[rank[0]],
			division,
		};
	}
}
