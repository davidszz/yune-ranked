import type { User, Guild } from 'discord.js';

import type { Yune } from '@client';
import { EventListener } from '@structures/EventListener';

export default class BasicInfosUpdateListener extends EventListener {
	constructor(client: Yune) {
		super(client, {
			events: ['userUpdate', 'guildUpdate', 'guildCreate'],
		});
	}

	async onUserUpdate(_: User, user: User) {
		await user.client.database.members.updateMany(
			{ userId: user.id },
			{
				$set: {
					avatar: user.avatar,
					discriminator: user.discriminator,
					username: user.username,
				},
			}
		);
	}

	onGuildCreate(guild: Guild) {
		this.updateGuild(guild);
	}

	onGuildUpdate(_: Guild, guild: Guild) {
		this.updateGuild(guild);
	}

	async updateGuild(guild: Guild) {
		await guild.client.database.guilds.update(guild.id, {
			$set: {
				icon: guild.icon,
				name: guild.name,
			},
		});
	}
}
