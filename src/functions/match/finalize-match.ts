import type { Yune } from '@client';
import type { IMatchSchema } from '@database/schemas/MatchSchema';
import { updateRankRole } from '@functions/member/update-rank-role';
import { DEFAULT_USER_MMR } from '@utils/Constants';
import { MatchStatus } from '@utils/MatchStatus';
import { Ranks } from '@utils/Ranks';
import { RankUtils } from '@utils/RankUtils';
import { UserRank } from '@utils/UserRank';

import { updateNicknames } from './update-nicknames';

interface IFinalizeMatchData {
	client: Yune;
	matchData: IMatchSchema;
}

export async function finalizeMatch({ client, matchData }: IFinalizeMatchData) {
	const matchMmr = Math.floor(
		matchData.participants.reduce(
			(acc, val) => acc + (typeof val.member === 'string' ? 0 : val.member?.mmr ?? DEFAULT_USER_MMR),
			0
		) / matchData.participants.length
	);

	const collectedInfos: {
		userId: string;
		win: boolean;
		modifiedPdls: number;
		oldRank: UserRank;
		newRank: UserRank;
	}[] = [];

	for (const participant of matchData.participants) {
		const member = typeof participant.member === 'string' ? null : participant.member;
		const team = matchData.teams.find((x) => x.teamId === participant.teamId);

		const calcOptions = {
			mmr: matchMmr,
			rank: member.rank ?? UserRank.Unranked,
			mvp: participant.mvp,
		};

		let rank = member.rank ?? UserRank.Unranked;

		let pdl = member.pdl ?? 0;
		let modifiedPdls = 0;
		let { mmr } = member;

		const isUnranked = rank === UserRank.Unranked;

		if (team.win) {
			const wonPdlAmount = RankUtils.calculateWonPdlAmount(calcOptions);
			modifiedPdls = wonPdlAmount;

			const newRankIfUnranked = participant.mvp ? UserRank.Bronze3 : UserRank.Bronze1;
			rank = rank !== UserRank.Unranked ? rank : newRankIfUnranked;

			if (isUnranked) {
				mmr = Ranks[newRankIfUnranked].mmr;
			} else {
				mmr += wonPdlAmount;
				pdl += wonPdlAmount;

				while (pdl >= Ranks[rank].maxPdl && Ranks[rank + 1] !== null) {
					pdl -= Ranks[rank].maxPdl;
					rank++;
				}
			}
		} else {
			const losePdlAmount = RankUtils.calculateLosePdlAmount(calcOptions);
			modifiedPdls = losePdlAmount;

			const newRankIfUnranked = participant.mvp ? UserRank.Iron2 : UserRank.Iron1;
			rank = rank !== UserRank.Unranked ? rank : newRankIfUnranked;

			if (isUnranked) {
				mmr = Ranks[newRankIfUnranked].mmr;
			} else {
				mmr = Math.max(mmr - losePdlAmount, 100);
				if (pdl > 0) {
					pdl = Math.max(pdl - losePdlAmount, 0);
				} else if (Ranks[rank - 1] && rank - 1 !== UserRank.Unranked) {
					pdl = Ranks[rank - 1].maxPdl - losePdlAmount;
					rank--;
				}
			}
		}

		collectedInfos.push({
			userId: participant.userId,
			modifiedPdls,
			oldRank: member.rank,
			newRank: rank,
			win: team.win,
		});

		await client.database.members.update(
			{ _id: member._id },
			{
				$set: {
					rank,
					pdl,
					mmr,
				},
				$inc: {
					wins: team.win ? 1 : 0,
					loses: team.win ? 0 : 1,
					mvps: participant.mvp ? 1 : 0,
				},
			}
		);
	}

	await client.database.matches.update(matchData._id, {
		$set: {
			status: MatchStatus.Ended,
			endedAt: new Date(),
			participants: matchData.participants.map((x) => ({
				...x,
				member: typeof x.member === 'string' ? x.member : x.member._id,
				...collectedInfos.find((c) => c.userId === x.userId),
			})),
		},
	});

	const match = client.matches.cache.get(matchData.matchId);
	if (!match.guild) return;

	updateNicknames(match.guild);

	const members = match.participants
		.map((x) => {
			const data = matchData.participants.find((y) => y.userId === x.id);
			return {
				rank: typeof data.member === 'string' ? 0 : data.member.rank,
				member: x,
			};
		})
		.filter(Boolean);

	await updateRankRole({
		guild: match.guild,
		members,
	});
}
