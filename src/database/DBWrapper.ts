import mongoose, { Mongoose } from 'mongoose';

import { Logger } from '@services/Logger';

import { ClientRepository } from './repositories/ClientRepository';
import { GuildRepository } from './repositories/GuildRepository';
import { MatchRepository } from './repositories/MatchRepository';
import { MemberRepository } from './repositories/MemberRepository';
import { SubscriptionCodeRepository } from './repositories/SubscriptionCodeRepository';

export class DBWrapper {
	mongoose: Mongoose;

	matches: MatchRepository;
	members: MemberRepository;
	guilds: GuildRepository;
	clients: ClientRepository;
	subscriptionCodes: SubscriptionCodeRepository;

	constructor() {
		this.mongoose = mongoose;
	}

	async connect() {
		await this.mongoose.connect(process.env.MONGODB_URI).then((mongodb) => {
			this.matches = new MatchRepository(mongodb);
			this.members = new MemberRepository(mongodb);
			this.guilds = new GuildRepository(mongodb);
			this.clients = new ClientRepository(mongodb);
			this.subscriptionCodes = new SubscriptionCodeRepository(mongodb);

			Logger.custom({ name: 'MONGODB', options: ['cyan'] }, 'Database connection estabilished!');
		});
	}
}
