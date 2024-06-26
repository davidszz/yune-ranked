import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import moment from 'moment';

import type { Yune } from '@client';
import { Logger } from '@services/Logger';
import { Loader } from '@structures/Loader';
import { Emojis } from '@utils/Emojis';
import { Utils } from '@utils/Utils';

export class LocalesLoader extends Loader {
	constructor(client: Yune) {
		super(client, {
			preLoad: true,
		});
	}

	async initialize() {
		Logger.info('Initializing lang files...');

		i18next.on('languageChanged', (lng) => {
			moment.locale(lng);
		});

		await i18next.use(Backend).init({
			backend: {
				loadPath: './src/locales/{{lng}}/{{ns}}.json',
			},
			cleanCode: true,
			fallbackLng: ['pt-BR', 'en-US'],
			defaultNS: 'commands',
			lng: 'pt-BR',
			ns: ['commands', 'misc', 'events'],
			interpolation: {
				skipOnVariables: false,
				defaultVariables: {
					...Object.fromEntries(Object.entries(Emojis).map((x) => [`e_${Utils.pascalToSnakecase(x[0])}`, x[1]])),
					support_guild_url: process.env.SUPPORT_GUILD_URL,
				},
				format(value, format) {
					if (format.startsWith('fromNow')) {
						return moment(value).fromNow(format === 'fromNow(true)');
					}

					if (value instanceof Date) {
						return moment(value).format(format);
					}
					return value;
				},
			},
		});

		Logger.success('Lang files initialized!');
	}
}
