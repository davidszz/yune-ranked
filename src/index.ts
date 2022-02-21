import 'dotenv/config';

import { Intents } from 'discord.js';

import { Yune } from '@client';
import { DBWrapper } from '@database/DBWrapper';
import { Logger } from '@services/Logger';

const database = new DBWrapper();
database.connect().then(async () => {
	const clientsData = await database.clients.findMany({
		expiresAt: {
			$gte: new Date(),
		},
	});

	Logger.info(`Initializing ${clientsData.length} clients!`);

	for (const clientData of clientsData) {
		const client = new Yune({
			token: clientData.token,
			guildId: clientData.guildId,
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES],
			database,
		});

		await client.start();
		console.log('-'.repeat(24));
	}
});

process.on('unhandledRejection', console.error);
