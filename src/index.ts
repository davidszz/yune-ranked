import 'dotenv/config';

import { Intents } from 'discord.js';

import { Yune } from '@client';
import { DBWrapper } from '@database/DBWrapper';
import { Logger } from '@services/Logger';

const database = new DBWrapper();
database.connect().then(async () => {
	if (process.env.NODE_ENV?.trim() === 'development') {
		const client = new Yune({
			token: process.env.DEVELOPMENT_TOKEN,
			guildId: process.env.DEVELOPMENT_GUILD_ID,
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES],
			database,
		});

		await client.start();
		return;
	}

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
	}
});

process.on('unhandledRejection', console.error);
