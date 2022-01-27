import { GuildMember } from 'discord.js';
import { Document, FilterQuery, model, Mongoose, QueryOptions, UpdateQuery } from 'mongoose';

import { Repository } from '../Repository';
import { IMemberSchema, MemberSchema } from '../schemas/MemberSchema';

export class MemberRepository extends Repository<IMemberSchema> {
	constructor(mongoose: Mongoose) {
		super(mongoose, model('Member', MemberSchema));
	}

	parse(entity: Document<IMemberSchema>): IMemberSchema {
		return {
			...(super.parse(entity) ?? ({} as IMemberSchema)),
		};
	}

	async update(
		query: GuildMember | FilterQuery<IMemberSchema>,
		entity: UpdateQuery<IMemberSchema>,
		options: QueryOptions = { upsert: true, new: true }
	) {
		await super.update(
			query instanceof GuildMember ? { userId: query.id, guildId: query.guild.id } : query,
			entity,
			options
		);
	}

	async findOne(query: GuildMember | FilterQuery<IMemberSchema>, projection?: any) {
		if (query instanceof GuildMember) {
			return super.findOne({ userId: query.id, guildId: query.guild.id }, projection);
		}

		return super.findOne(query, projection);
	}
}
