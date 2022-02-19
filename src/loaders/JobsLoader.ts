import readdir from 'readdirp';

import { Logger } from '@services/Logger';
import { Job } from '@structures/Job';
import { Loader } from '@structures/Loader';
import { FileUtils } from '@utils/FileUtils';

export class JobsLoader extends Loader {
	async initialize() {
		const files = readdir(FileUtils.resolve(FileUtils.rootPath, 'jobs'), {
			directoryFilter: '!sub',
		});

		const status = { failed: 0, success: 0 };
		for await (const file of files) {
			if (/\.(js|ts)$/i.test(file.basename)) {
				try {
					const File = (await import(file.fullPath)).default;
					const job = new File(this.client);
					if (job instanceof Job) {
						if (job.startInstantly) {
							await job.execute();
						}
						job.startTimeout();
						status.success++;
					}
				} catch (err) {
					status.failed++;
					Logger.error(`Failed to load the job file ${file.basename}:`, err);
				}
			}
		}

		if (status.failed) {
			Logger.warn(`${status.success} jobs started and ${status.failed} failed`);
		} else {
			Logger.success(`All ${status.success} jobs started!`);
		}
	}
}
