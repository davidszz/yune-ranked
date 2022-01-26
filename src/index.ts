import 'dotenv/config';

import { Intents } from 'discord.js';

import { Yune } from '@client';

const client = new Yune({
	token: process.env.DEVELOPMENT_TOKEN,
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES],
});

client.start();
