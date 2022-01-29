import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

import type { Yune } from '@client';
import { Logger } from '@services/Logger';
import { Loader } from '@structures/Loader';
import { Emojis } from '@utils/Constants';

export class LocalesLoader extends Loader {
	constructor(client: Yune) {
		super(client, {
			preLoad: true,
		});
	}

	async initialize() {
		Logger.info('Initializing lang files...');

		await i18next.use(Backend).init({
			backend: {
				loadPath: './src/locales/{{lng}}/{{ns}}.json',
			},
			cleanCode: true,
			fallbackLng: ['pt-BR', 'en-US'],
			defaultNS: 'commands',
			lng: 'pt-BR',
			ns: ['commands', 'misc'],
			interpolation: {
				skipOnVariables: false,
				defaultVariables: {
					...Object.fromEntries(Object.entries(Emojis).map((x) => [`e_${x[0]}`, x[1]])),
				},
			},
		});

		Logger.success('Lang files initialized!');
	}
}
