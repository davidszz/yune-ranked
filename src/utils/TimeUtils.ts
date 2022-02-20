import humanizeDuration, { HumanizerOptions } from 'humanize-duration';

export class TimeUtils {
	static parseDuration(duration: string, defaultMultiplier = 1) {
		if (/^\d+$/.test(duration)) {
			return Number(duration) * defaultMultiplier;
		}

		const days = duration.match(/(\d+)(\s+)?d((ay|ia)(s)?)?(\s|$)/i);
		const hours = duration.match(/(\d+)(\s+)?h((our|ora)(s)?)??(\s|$)/i);
		const minutes = duration.match(/(\d+)(\s+)?m((in|inute|inuto)(s)?)??(\s|$)/i);
		const seconds = duration.match(/(\d+)(\s+)?s((ec|eg|econd|egundo)(s)?)??(\s|$)/i);

		let time = 0;
		if (days) time += Number(days[1]) * 86400000;
		if (hours) time += Number(hours[1]) * 3600000;
		if (minutes) time += Number(minutes[1]) * 60000;
		if (seconds) time += Number(seconds[1]) * 1000;

		return time;
	}

	static humanizeDuration(ms: number, options?: HumanizerOptions) {
		return humanizeDuration(ms, {
			units: ['d', 'h', 'm', 's'],
			language: 'pt',
			round: true,
			...options,
		});
	}
}
