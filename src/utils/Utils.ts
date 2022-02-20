interface IRandomStrOptions {
	length?: number;
	allow?: ('uppercase' | 'lowercase' | 'number')[];
}

export class Utils {
	static capitalize(str: string) {
		return str.charAt(0).toUpperCase().concat(str.slice(1));
	}

	static randomStr(options?: IRandomStrOptions) {
		const opts = {
			length: 12,
			allow: ['uppercase', 'lowercase', 'number'],
			...options,
		};

		if (!opts.allow.includes('uppercase') && !opts.allow.includes('lowercase')) {
			opts.allow.push('lowercase');
		}

		const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';

		const result = [];
		for (let i = 0; i < opts.length; i++) {
			let char = chars.charAt(Math.floor(Math.random() * chars.length));
			while (
				(!opts.allow.includes('lowercase') && char === char.toLowerCase()) ||
				(!opts.allow.includes('number') && !Number.isNaN(char))
			) {
				char = chars.charAt(Math.floor(Math.random() * chars.length));
			}

			if (opts.allow.includes('uppercase') && Math.random() > 0.5) {
				char = char.toUpperCase();
			}

			result.push(char);
		}

		return result.join('');
	}
}
