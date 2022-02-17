import type { Yune } from '@client';
import type { IMatchSchema } from '@database/schemas/MatchSchema';
import { DEFAULT_USER_MMR, MatchStatus, Ranks, UserRank } from '@utils/Constants';
import { RankUtils } from '@utils/RankUtils';

interface IFinalizeMatchData {
	client: Yune;
	match: IMatchSchema;
}

export async function finalizeMatch({ client, match }: IFinalizeMatchData) {
	for (const participant of match.participants) {
		const member = typeof participant.member === 'string' ? null : participant.member;
		const team = match.teams.find((x) => x.teamId === participant.teamId);

		const calcOptions = {
			mmr: member.mmr ?? DEFAULT_USER_MMR,
			rank: member.rank ?? UserRank.UNRANKED,
			mvp: participant.mvp,
		};

		let rank = member.rank ?? UserRank.UNRANKED;
		let { pdl } = member;
		let mmr = 0;

		if (team.win) {
			const wonPdlAmount = RankUtils.calculateWonPdlAmount(calcOptions);
			rank = member.rank !== UserRank.UNRANKED ? member.rank : participant.mvp ? UserRank.BRONZE_3 : UserRank.BRONZE_1;

			mmr = wonPdlAmount;
			pdl += wonPdlAmount;
			while (pdl >= Ranks[rank].maxPdl && Ranks[rank + 1] !== null) {
				pdl -= Ranks[rank].maxPdl;
				rank++;
			}
		} else {
			const losePdlAmount = RankUtils.calculateLosePdlAmount(calcOptions);
			rank = member.rank !== UserRank.UNRANKED ? member.rank : participant.mvp ? UserRank.IRON_2 : UserRank.IRON_1;

			mmr = -losePdlAmount;
			if (pdl > 0) {
				pdl = Math.max(pdl - losePdlAmount, 0);
			} else if (Ranks[rank - 1]) {
				pdl = Ranks[rank - 1].maxPdl - losePdlAmount;
				rank--;
			}
		}

		await client.database.members.update(
			{ _id: member._id },
			{
				$set: {
					rank,
					pdl,
				},
				$inc: {
					mmr,
					wins: team.win ? 1 : 0,
					loses: team.win ? 0 : 1,
				},
			}
		);
	}

	await client.database.matches.update(match._id, {
		$set: {
			status: MatchStatus.ENDED,
			endedAt: new Date(),
		},
	});
}
