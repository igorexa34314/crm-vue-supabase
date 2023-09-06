import { SortType } from './services/record';

export const AppTitle: string = import.meta.env.VITE_APP_TITLE || 'CRM VUE';
export const SITE_KEY = '0x4AAAAAAAJbSXrFU6QhWigO';

export const vuetifyThemeNames = {
	dark: 'customDark',
	light: 'customLight',
} as const;

export const availableLocales = ['ru-RU', 'uk-UA', 'en-US'] as const;
export const availableCurrencies = ['USD', 'EUR', 'RUB', 'UAH'] as const;

export const LOCALE_KEY = import.meta.env.VITE_APP_LOCALE_KEY || 'lang';
export const DARK_MODE_KEY = import.meta.env.VITE_APP_DARK_MODE_KEY || 'darkMode';

export const DEFAULT_BILL = +import.meta.env.VITE_APP_DEFAULT_BILL || 1000;
export const DEFAULT_CURRENCY = (import.meta.env.VITE_APP_DEFAULT_CURRENCY ||
	'USD') as (typeof availableCurrencies)[number];
export const DEFAULT_LOCALE = (import.meta.env.VITE_APP_DEFAULT_LOCALE || 'uk-UA') as string;
export const DEFAULT_THEME =
	vuetifyThemeNames[import.meta.env.VITE_APP_DEFAULT_THEME as keyof typeof vuetifyThemeNames] ||
	vuetifyThemeNames.light;

export const DEFAULT_CATEGORY_LIMIT = 100;
export const DEFAULT_RECORD_AMOUNT = 20;
export const DEFAULT_RECORDS_PER_PAGE = 5;
export const DEFAULT_SORT_TYPE: SortType = 'desc';
