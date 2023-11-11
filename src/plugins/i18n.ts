import { createI18n, type I18n, type MessageSchema, type DateTimeFormatSchema, type localeKey } from 'vue-i18n';
import { nextTick } from 'vue';
import fallbackMessages from '@intlify/unplugin-vue-i18n/messages';
import datetimeFormats from '@/utils/datetimeFormats.json';
import numberFormats from '@/utils/numberFormats';
import { LocaleService } from '@/services/locale';
import { availableLocales, LOCALE_KEY, DEFAULT_LOCALE } from '@/global-vars';
import { useSnackbarStore } from '@/stores/snackbar';

export const initI18n = async () => {
	const locale: string = JSON.parse(localStorage.getItem(LOCALE_KEY) || 'null') || DEFAULT_LOCALE;
	try {
		const messages = { [locale]: await LocaleService.fetchLocaleTranslation(locale) };
		return createI18nInstance(locale, messages);
	} catch (err) {
		try {
			console.error('Unable to load translations with this locale. Loading fallback locale from server...');
			const messages = { [DEFAULT_LOCALE]: await LocaleService.fetchLocaleTranslation(DEFAULT_LOCALE) };
			return createI18nInstance(DEFAULT_LOCALE, messages);
		} catch (error) {
			console.error('Unable to load translations from server', err);
			return createI18nInstance(DEFAULT_LOCALE, fallbackMessages);
		}
	}
};

const createI18nInstance = (locale: string, messages: { [key: string]: any } | undefined) => {
	return createI18n({
		legacy: false, // Vuetify and composition API does not support the legacy mode of vue-i18n
		locale: locale || DEFAULT_LOCALE,
		fallbackLocale: DEFAULT_LOCALE,
		messages: messages as Record<localeKey, MessageSchema>,
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
};

export const setI18nLocaleMessages = async <T extends I18n<any, any, any, any, false>>(
	i18n: T,
	locale: string = DEFAULT_LOCALE
) => {
	// Load locale if not available yet.
	if (!i18n.global.availableLocales.includes(locale)) {
		LocaleService.fetchLocaleTranslation(locale)
			.then(messages => {
				// Add locale.
				i18n.global.setLocaleMessage(locale, messages);
				return nextTick();
			})
			.then(() => {
				localStorage.setItem(LOCALE_KEY, JSON.stringify(locale));
				i18n.global.locale.value = locale;
				/**
				 * NOTE:
				 * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
				 * The following is an example for axios.
				 *
				 * axios.defaults.headers.common['Accept-Language'] = locale
				 */
				document.querySelector('html')?.setAttribute('lang', locale);
			})
			.catch(() => {
				// @ts-ignore
				useSnackbarStore().showMessage(i18n.global.t('error_loading_locale'));
			});
	}
};
