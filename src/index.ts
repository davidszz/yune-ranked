import 'dotenv/config';

import { Intents } from 'discord.js';

import { Yune } from '@client';
import { DBWrapper } from '@database/DBWrapper';

const database = new DBWrapper();
database.connect().then(async () => {
	const client = new Yune({
		token: process.env.DEVELOPMENT_TOKEN,
		intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES],
		database,
	});

	client.start();
});
