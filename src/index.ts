import 'dotenv/config';

import { Collection, IntentsBitField } from 'discord.js';

import { Yune } from '@client';
import { DBWrapper } from '@database/DBWrapper';
import type { IClientSchema } from '@database/schemas/ClientSchema';
import { Logger } from '@services/Logger';

const clients: Collection<string, Yune> = new Collection();

const database = new DBWrapper();

database.connect().then(async () => {
	if (process.env.NODE_ENV?.trim() === 'production') {
		const changeStream = database.clients.model.watch(null, { fullDocument: 'updateLookup' });
		changeStream.on('change', async (change) => {
			const fullDocument = change.fullDocument as IClientSchema;

			if (['insert', 'update'].includes(change.operationType)) {
				if (checkNewBot(fullDocument)) {
					const client = await createClient(fullDocument);
					await client.start();
				}
			} else if (change.operationType === 'delete') {
				const documentKey = (change.documentKey as unknown as { _id: string })._id;
				if (documentKey) {
					const clientId = clients.findKey((x) => x.user?.id === documentKey) || documentKey;
					const client = clients.get(clientId);
					if (client) {
						client.destroy();
						clients.delete(clientId);
					}
				}
			}
		});
	}

	const clientsData = await database.clients.findMany({
		expiresAt: {
			$gte: new Date(),
		},
	});

	Logger.info(`Initializing ${clientsData.length} clients!`);

	for (const clientData of clientsData) {
		const client = await createClient(clientData);
		await client.start();

		console.log('—'.repeat(36));
	}
});

function checkNewBot(data: IClientSchema) {
	if (!data) {
		return false;
	}

	const clientId = clients.findKey(
		(x) => x.user?.id === data._id || x.guildId === data.guildId || x.token === data.token
	);
	if (!clientId) {
		return true;
	}

	const client = clients.get(clientId);
	if (
		client.token === data.token &&
		client?.user.id === data._id &&
		client.guildId === data.guildId &&
		client.readyAt
	) {
		return false;
	}

	client.destroy();
	clients.delete(clientId);

	return true;
}

async function createClient(data: IClientSchema) {
	const client = new Yune({
		token: data.token,
		guildId: data.guildId,
		intents: [
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMembers,
			IntentsBitField.Flags.GuildMembers,
			IntentsBitField.Flags.GuildMessages,
		],
		database,
	});

	clients.set(data._id, client);
	return client;
}

process.on('unhandledRejection', console.error);
