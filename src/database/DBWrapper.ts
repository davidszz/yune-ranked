import mongoose, { Mongoose } from 'mongoose';

import { Logger } from '@services/Logger';

import { MatchRepository } from './repositories/MatchRepository';
import { MemberRepository } from './repositories/MemberRepository';

export class DBWrapper {
	mongoose: Mongoose;

	matches: MatchRepository;
	members: MemberRepository;

	constructor() {
		this.mongoose = mongoose;
	}

	async connect() {
		await this.mongoose.connect(process.env.MONGODB_URI).then((mongodb) => {
			this.matches = new MatchRepository(mongodb);
			this.members = new MemberRepository(mongodb);

			Logger.custom({ name: 'MONGODB', options: ['cyan'] }, 'Database connection estabilished!');
		});
	}
}
