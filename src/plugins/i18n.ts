import { createI18n, type I18n, type MessageSchema, type DateTimeFormatSchema, type localeKey } from 'vue-i18n';
import { nextTick } from 'vue';
import datetimeFormats from '@/utils/datetimeFormats.json';
import numberFormats from '@/utils/numberFormats';
import { fetchLocaleTranslation } from '@/api/locale';
import { availableLocales, LOCALE_KEY, DEFAULT_LOCALE } from '@/global-vars';
import { useSnackbarStore } from '@/stores/snackbar';

export const getLocale = () => (JSON.parse(localStorage.getItem(LOCALE_KEY) || 'null') as string) || DEFAULT_LOCALE;

export const loadMessages = async (locale: string) => {
	try {
		const messages = await fetchLocaleTranslation(locale);
		return messages;
	} catch (err) {
		try {
			console.error('Unable to load translations with this locale. Loading fallback locale from server...');
			const messages = await fetchLocaleTranslation(DEFAULT_LOCALE);
			return messages;
		} catch (error) {
			console.error('Unable to load translations from server', err);
			const fallbackMessages = (await import('@intlify/unplugin-vue-i18n/messages')) as Record<string, any>;
			return fallbackMessages;
		}
	}
};

export function setupI18n(locale: string, messages: Record<string, any>) {
	const i18n = createI18n({
		legacy: false, // Vuetify and composition API does not support the legacy mode of vue-i18n
		locale: locale ?? DEFAULT_LOCALE,
		fallbackLocale: DEFAULT_LOCALE,
		messages: { [locale]: messages } as Record<localeKey, MessageSchema>,
		// Using same number formats for each locale
		numberFormats,

		// Using same datetime formats for each locale
		datetimeFormats: availableLocales.reduce(
			(formats, locale) => ({
				...formats,
				[locale]: datetimeFormats['en-US'],
			}),
			{} as Record<localeKey, DateTimeFormatSchema>
		),
	});
	return i18n;
}

export function setI18nLanguage(i18n: I18n<any, any, any, any, false>, locale: string = DEFAULT_LOCALE) {
	i18n.global.locale.value = locale;
	/**
	 * NOTE:
	 * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
	 * The following is an example for axios.
	 *
	 * axios.defaults.headers.common['Accept-Language'] = locale
	 */
	document.querySelector('html')?.setAttribute('lang', locale);
}

export const setI18nLocaleMessages = async (i18n: I18n<any, any, any, any, false>, locale: string = DEFAULT_LOCALE) => {
	try {
		// Load locale if not available yet.
		if (!i18n.global.availableLocales.includes(locale)) {
			const messages = await loadMessages(locale);
			// Add locale.
			i18n.global.setLocaleMessage(locale, messages);
			await nextTick();
			localStorage.setItem(LOCALE_KEY, JSON.stringify(locale));
			setI18nLanguage(i18n, locale);
		}
	} catch (error) {
		// @ts-ignore
		useSnackbarStore().showMessage(i18n.global.t('error_loading_locale'));
	}
};
