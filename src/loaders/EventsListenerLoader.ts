import readdir from 'readdirp';

import type { Yune } from '@client';
import { Logger } from '@services/Logger';
import { EventListener } from '@structures/EventListener';
import { Loader } from '@structures/Loader';
import { FileUtils } from '@utils/FileUtils';
import { Utils } from '@utils/Utils';

export class EventsListenerLoader extends Loader {
	constructor(client: Yune) {
		super(client, {
			preLoad: true,
		});
	}

	async initialize() {
		const files = readdir(FileUtils.resolve(FileUtils.rootPath, 'listeners'));

		const status = { success: 0, failed: 0 };
		for await (const file of files) {
			if (/\.(js|ts)$/i.test(file.basename)) {
				try {
					const File = (await import(file.fullPath)).default;
					const eventListener = new File(this.client);
					if (eventListener instanceof EventListener) {
						status.success++;
						for (const eventName of eventListener.events) {
							const listener = eventListener[`on${Utils.capitalize(eventName)}`];
							if (listener) {
								this.client.on(eventName, listener.bind(eventListener));
							}
						}
					}
				} catch (err) {
					status.failed++;
					Logger.error(`Failed to load the event listener file ${file.basename}:`, err);
				}
			}
		}

		if (status.failed) {
			Logger.warn(`${status.success} events started listening and ${status.failed} failed`);
		} else {
			Logger.success(`All ${status.success} events started listening!`);
		}
	}
}
