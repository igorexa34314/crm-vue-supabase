export default {
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
} as const;
