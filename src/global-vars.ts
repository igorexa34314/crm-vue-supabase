// Currency exchanger
export const EXCHANGER_API_URL: string = import.meta.env.VITE_EXCHANGER_API_URL;
export const EXCHANGER_API_KEY: string = import.meta.env.VITE_EXCHANGER_API_KEY;

// Cloudflare turnstile
export const loadTurnstileCbName = 'onloadTurnstileCallback' as const;
export const turnstileScriptSrc = `${
	import.meta.env.VITE_TURNSTILE_SCRIPT_SRC
}?render=explicit&onload=${loadTurnstileCbName}`;
export const TURNSTILE_SITE_KEY: string = import.meta.env.VITE_TURNSTILE_SITE_KEY;

// Auth providers
export const supportedOAuthProviders = ['google', 'facebook', 'github'] as const;

// Vuetify
export const vuetifyThemeNames = {
	dark: 'customDark',
	light: 'customLight',
} as const;

// I18n
export const availableLocales = ['ru-RU', 'uk-UA', 'en-US'] as const;
export const availableCurrencies = ['USD', 'EUR', 'RUB', 'UAH'] as const;

// Keys stored in localstorage
export const LOCALE_KEY: string = import.meta.env.VITE_APP_LOCALE_KEY || 'lang';
export const DARK_MODE_KEY: string = import.meta.env.VITE_APP_DARK_MODE_KEY || 'darkMode';

// Vars set on server
export const SERVER_CURRENCY = (import.meta.env.VITE_SERVER_CURRENCY || 'USD') as (typeof availableCurrencies)[number];
export const recordTypes = ['income', 'outcome'] as const;

// App vars
export const AppTitle: string = import.meta.env.VITE_APP_TITLE || 'CRM VUE';
export const DEFAULT_THEME =
	vuetifyThemeNames[import.meta.env.VITE_APP_DEFAULT_THEME as keyof typeof vuetifyThemeNames] ||
	vuetifyThemeNames.light;
export const DEFAULT_BILL = +import.meta.env.VITE_APP_DEFAULT_BILL || 1000;
export const DEFAULT_LOCALE: string = import.meta.env.VITE_APP_DEFAULT_LOCALE || 'uk-UA';
export const DEFAULT_CATEGORY_LIMIT = 100;
export const DEFAULT_RECORD_AMOUNT = 20;
export const DEFAULT_RECORDS_PER_PAGE = 5;
export const DEFAULT_SORT_TYPE = 'desc';
