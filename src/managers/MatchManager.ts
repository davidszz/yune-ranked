import { Collection } from 'discord.js';

import type { Yune } from '@client';
import { IMatchSchema } from '@database/schemas/MatchSchema';
import { Match } from '@structures/Match';
import { MatchStatus } from '@utils/MatchStatus';

import { BaseManager } from './BaseManager';

interface IFetchOptions {
	force?: boolean;
	cache?: boolean;
}

export class MatchManager extends BaseManager {
	cache: Collection<number, Match>;

	constructor(client: Yune) {
		super(client);

		this.cache = new Collection();
	}

	add(data: IMatchSchema) {
		const match = new Match(this.client, data);
		this.cache.set(match.id, match);
		return match;
	}

	async delete(id: number) {
		const cached = this.cache.get(id);
		if (cached) {
			await cached.delete();
		} else {
			await this.client.database.matches.deleteOne({ matchId: id });
		}
		return this.cache;
	}

	fetch(): Promise<Collection<number, Match>>;
	fetch(id: number, options?: IFetchOptions): Promise<Match>;
	async fetch(id?: number, options?: IFetchOptions): Promise<Match | Collection<number, Match>> {
		if (id !== undefined) {
			let match = this.cache.get(id);
			if (!options?.force && match) {
				return match;
			}

			const data = await this.client.database.matches.findOne({ matchId: id });
			if (!data) {
				throw new Error('Match not found');
			}

			match = new Match(this.client, data);
			if (options?.cache !== false) {
				this.cache.set(data.matchId, match);
			}

			return match;
		}

		const data = await this.client.database.matches.findMany({
			guildId: this.client.guildId,
			status: MatchStatus.InGame,
		});

		const fetchedMatches: Collection<number, Match> = new Collection();
		for (const matchData of data) {
			const match = this.add(matchData);
			fetchedMatches.set(match.id, match);
		}

		return fetchedMatches;
	}
}
