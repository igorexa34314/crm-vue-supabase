export const localeKey = import.meta.env.VITE_APP_LOCALE_KEY || 'lang';

export const defaultLocale = import.meta.env.VITE_APP_DEFAULT_LOCALE || 'uk-UA';
export const availableLocales = ['ru-RU', 'uk-UA', 'en-US'] as const;

export const numberFormats = {
	'en-US': {
		currency: {
			style: 'currency',
			currency: 'USD',
			useGrouping: true,
			notation: 'standard',
		},
	},
	'ru-RU': {
		currency: {
			style: 'currency',
			currency: 'RUB',
			useGrouping: true,
			currencyDisplay: 'symbol',
		},
	},
	'uk-UA': {
		currency: {
			style: 'currency',
			currency: 'UAH',
			useGrouping: true,
			currencyDisplay: 'symbol',
		},
	},
};

export const datetimeFormats = {
	'en-US': {
		shortdate: {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		},
		short: {
			year: 'numeric',
			month: 'long',
			day: '2-digit',
		},
		long: {
			day: '2-digit',
			year: '2-digit',
			month: '2-digit',
			weekday: 'long',
			hour: '2-digit',
			minute: '2-digit',
		},
		daytime: {
			weekday: 'long',
			hour: '2-digit',
			minute: '2-digit',
		},
		time: {
			hour: '2-digit',
			minute: '2-digit',
		},
	},
};
