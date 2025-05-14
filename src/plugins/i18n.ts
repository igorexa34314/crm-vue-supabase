import {
	createI18n,
	type I18n,
	type MessageSchema,
	type DateTimeFormatSchema,
	type LocaleKey,
	type I18nOptions,
} from 'vue-i18n';
import { nextTick } from 'vue';
import { datetimeFormats } from '@/constants/i18n';
import { numberFormats } from '@/constants/i18n';
import { fetchLocaleTranslation } from '@/api/locale';
import { availableLocales, localeKey, defaultLocale } from '@/constants/i18n';
import { useSnackbarStore } from '@/stores/snackbar';

export const getLocale = () =>
	(JSON.parse(localStorage.getItem(localeKey) || 'null') as string) || defaultLocale;

const loadLocalMessages = async (locale: string) => {
	const messages = (await import('@intlify/unplugin-vue-i18n/messages'))['default'];
	if (!messages || typeof messages !== 'object') {
		return {} as Record<string, unknown>;
	}

	return locale in messages ? messages[locale] : messages['en-US'];
};

export const loadMessages = async (locale: string) => {
	try {
		const messages = await fetchLocaleTranslation(locale);
		return messages;
	} catch (err) {
		try {
			console.error(
				'Unable to load translations with this locale from server. Loading translations for fallback locale...'
			);
			const messages = await fetchLocaleTranslation(defaultLocale);
			return messages;
		} catch {
			console.error('Unable to load translations from server', err);
			const fallbackMessages = await loadLocalMessages(locale);
			return fallbackMessages;
		}
	}
};

export function setupI18n(locale: string, messages: Record<string, unknown>) {
	const i18n = createI18n({
		legacy: false, // Vuetify and composition API does not support the legacy mode of vue-i18n
		locale: locale ?? defaultLocale,
		fallbackLocale: defaultLocale,
		messages: { [locale]: messages } as Record<LocaleKey, MessageSchema>,
		// Using same number formats for each locale
		numberFormats: numberFormats as I18nOptions['numberFormats'],

		// Using same datetime formats for each locale
		datetimeFormats: availableLocales.reduce(
			(formats, locale) => ({
				...formats,
				[locale]: datetimeFormats['en-US'],
			}),
			{} as Record<LocaleKey, DateTimeFormatSchema>
		),
	});
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
	return i18n as I18n<any, {}, {}, string, false>;
}

export function setI18nLanguage(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
	i18n: I18n<any, {}, {}, string, false>,
	locale: string = defaultLocale
) {
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

export const setI18nLocaleMessages = async (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
	i18n: I18n<any, {}, {}, string, false>,
	locale: string = defaultLocale
) => {
	try {
		// Load locale if not available yet.
		if (!i18n.global.availableLocales.includes(locale)) {
			const messages = await loadMessages(locale);
			// Add locale.
			i18n.global.setLocaleMessage(locale, messages);
			await nextTick();
			localStorage.setItem(localeKey, JSON.stringify(locale));
			setI18nLanguage(i18n, locale);
		}
	} catch {
		useSnackbarStore().showMessage(i18n.global.t('error_loading_locales'));
	}
};
