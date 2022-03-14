import i18next, { StringMap, TFunction, TOptions } from 'i18next';

export function tFunction(locale: string) {
	return ((key: string | string[], options: TOptions<StringMap>) =>
		i18next.t(key, { ...options, lng: locale })) as TFunction;
}
