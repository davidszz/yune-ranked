import { Document, model, Mongoose } from 'mongoose';

import { Repository } from '../Repository';
import { IMatchSchema, MatchSchema, IMatchTeam } from '../schemas/MatchSchema';
import { IMemberSchema } from '../schemas/MemberModel';

interface ITeam extends Omit<IMatchTeam, 'members'> {
	members: IMemberSchema[];
}

interface IMatch extends Omit<IMatchSchema, 'teams'> {
	users: string[];
	teams: [ITeam, ITeam];
}

export class MatchRepository extends Repository<IMatchSchema, IMatch> {
	constructor(mongoose: Mongoose) {
		super(mongoose, model('Match', MatchSchema));
	}

	parse(entity: Document<IMatchSchema>): IMatch {
		const parsed = super.parse(entity);
		if (!parsed) {
			return null;
		}

		const users = [
			...parsed.teams[0].members.map((member) => member.userId),
			...parsed.teams[1].members.map((member) => member.userId),
		];

		return {
			users,
			...parsed,
		};
	}

	async getMatch(id: number) {
		return this.model
			.findOne({ matchId: id })
			.populate('teams.members')
			.then((doc) => this.parse(<any>doc));
	}
}
