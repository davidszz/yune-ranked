import readdir from 'readdirp';

import { Logger } from '@services/Logger';
import { Loader } from '@structures/Loader';
import { FileUtils } from '@utils/FileUtils';

export class CommandsLoader extends Loader {
	async initialize() {
		const files = readdir(FileUtils.resolve(FileUtils.rootPath, 'commands'));

		for await (const file of files) {
			if (/\.(js|ts)$/g.test(file.basename)) {
				try {
					const File = (await import(file.fullPath)).default;
					const command = new File(this.client);
					if (command) {
					}
				} catch (err) {
					Logger.error(`An error ocurrent on loader ${__filename} initialization:`, err);
				}
			}
		}
	}
}
