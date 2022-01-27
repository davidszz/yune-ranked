import colors, { Color } from 'colors';

export class Logger {
	static error(...args: any[]) {
		this.log({ name: 'ERROR', options: ['bold', 'red'] }, ...args);
	}

	static warn(...args: any[]) {
		this.log({ name: 'WARN', options: ['yellow'] }, ...args);
	}

	static info(...args: any[]) {
		this.log({ name: 'INFO', options: ['cyan'] }, ...args);
	}

	static success(...args: any[]) {
		this.log({ name: 'SUCCESS', options: ['green', 'bold'] }, ...args);
	}

	static custom(tag: { name: string; options: (keyof Color)[] }, ...args: any[]) {
		this.log(tag, ...args);
	}

	private static log(tag: { name: string; options: (keyof Color)[] }, ...args: any[]) {
		const date = new Date().toLocaleString('pt-BR', {
			timeZone: 'America/Sao_Paulo',
		});

		console.log(
			`[${tag.options.reduce((acc, val) => acc[val], colors.reset)(tag.name)}]`,
			`${colors.bold.grey(date)}`,
			...args
		);
	}
}
