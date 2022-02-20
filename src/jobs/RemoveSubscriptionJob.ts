import type { Yune } from '@client';
import { Logger } from '@services/Logger';
import { Job } from '@structures/Job';

export default class RermoveSubscriptionJob extends Job {
	constructor(client: Yune) {
		super(client, {
			name: 'removeSubscriptionJob',
			interval: 10000,
			startInstantly: true,
		});
	}

	async execute() {
		const expiredMembers = await this.client.database.members.findMany(
			{
				guildId: this.client.guildId,
				subscribed: true,
				subscriptionEndsAt: {
					$lte: new Date(),
				},
			},
			'_id userId'
		);

		if (expiredMembers?.length) {
			const { guild } = this.client;

			Logger.info(
				`Removing subscription from ${expiredMembers.length} members from guild ${
					guild?.name ?? 'UNKNOWN_GUILD_NAME'
				}...`
			);

			await this.client.database.members.update(
				{
					_id: {
						$in: expiredMembers.map((x) => x._id),
					},
				},
				{
					$unset: {
						subscribed: false,
						subscribedAt: 0,
						subscriptionCreatedBy: '',
						subscriptionEndsAt: 0,
					},
				}
			);

			if (guild) {
				const { subscriptionRoles } = await this.client.database.guilds.findOne(guild.id, 'subscriptionRoles');
				const validRoles = subscriptionRoles?.filter((x) => guild.roles.cache.has(x));

				if (validRoles?.length) {
					for (const { userId } of expiredMembers) {
						try {
							const member = await guild.members.fetch(userId);
							const toRemove = validRoles.filter((x) => member.roles.cache.has(x));
							if (toRemove.length) {
								await member.roles.remove(toRemove);
							}
						} catch {
							// Nothing
						}
					}
				}
			}

			Logger.success(
				`Removed ${expiredMembers.length} members subscription from guild ${guild?.name ?? 'UNKNOWN_GUILD_NAME'}!`
			);
		}
	}
}
