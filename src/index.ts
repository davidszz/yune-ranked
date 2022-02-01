import 'dotenv/config';

import { Intents } from 'discord.js';

import { Yune } from '@client';
import { DBWrapper } from '@database/DBWrapper';

const database = new DBWrapper();
database.connect().then(async () => {
	// await database.members.update(
	// 	{ userId: '787475567259287554', guildId: '880504665807147039' },
	// 	{
	// 		$set: {
	// 			rank: MemberRank.GRAND_MASTER,
	// 		},
	// 	}
	// );

	const client = new Yune({
		token: process.env.DEVELOPMENT_TOKEN,
		guildId: process.env.DEVELOPMENT_GUILD_ID,
		intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES],
		database,
	});

	client.start();
});

process.on('unhandledRejection', console.error);
