import type { Yune } from '@client';

interface IJobOptions {
	name: string;
	interval: number;
	startInstantly?: boolean;
}

export abstract class Job {
	client: Yune;
	name: string;
	interval: number;
	startInstantly: boolean;

	_timeout: NodeJS.Timeout;

	abstract execute(): Promise<void> | void;

	constructor(client: Yune, options: IJobOptions) {
		this.client = client;
		this.name = options.name;
		this.interval = options.interval;
		this.startInstantly = options.startInstantly;
	}

	startTimeout() {
		if (this._timeout) {
			clearTimeout(this._timeout);
		}

		this._timeout = this.setTimeout(async () => {
			await this.execute();
			this.startTimeout();
		}, this.interval);
	}

	private setTimeout(fn: any, delay: number): NodeJS.Timeout {
		const maxDelay = 2 ** 31 - 1;

		if (delay > maxDelay) {
			delay -= maxDelay;

			return setTimeout(() => {
				this.setTimeout.apply(undefined, [fn, delay]);
			}, maxDelay);
		}

		return setTimeout.apply(undefined, [fn, delay]);
	}
}
