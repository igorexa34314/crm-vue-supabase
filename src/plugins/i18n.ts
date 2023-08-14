import { createI18n, I18n, I18nOptions } from 'vue-i18n';
import { nextTick, WritableComputedRef } from 'vue';
import fallbackMessages from '@intlify/unplugin-vue-i18n/messages';
import datetimeFormats from '@/utils/datetimeFormats.json';
import numberFormats from '@/utils/numberFormats.json';
import { LocaleService } from '@/services/locale';
import { availableLocales, LOCALE_KEY, DEFAULT_LOCALE } from '@/globals';

export const initI18n = async () => {
	let locale: string = JSON.parse(localStorage.getItem(LOCALE_KEY) || 'null') || DEFAULT_LOCALE;
	const messages: { [key: string]: any } = fallbackMessages;
	try {
		messages[locale] = await LocaleService.fetchLocaleTranslation(locale);
	} catch (err) {
		locale = DEFAULT_LOCALE;
		console.log('Unable to load translations from server', err);
	} finally {
		return createI18n({
			legacy: false, // Vuetify does not support the legacy mode of vue-i18n
			locale: locale || DEFAULT_LOCALE,
			fallbackLocale: DEFAULT_LOCALE,
			messages: messages,
			// Using same number formats for each locale
			numberFormats: Object.assign(
				{},
				numberFormats,
				...availableLocales.map(locale => ({
					[numberFormats[locale]['currency']['currency']]: numberFormats[locale]
				}))
			) as I18nOptions['numberFormats'],

			// Using same datetime formats for each locale
			datetimeFormats: Object.assign(
				{},
				...availableLocales.map(locale => ({
					[locale]: datetimeFormats['en-US']
				}))
			)
		});
	}
};

export const setI18nLanguage = async (i18n: I18n, locale: string = DEFAULT_LOCALE) => {
	// Load locale if not available yet.
	if (!i18n.global.availableLocales.includes(locale)) {
		const messages = await LocaleService.fetchLocaleTranslation(locale);

		if (!messages) {
			return;
		}
		// Add locale.
		i18n.global.setLocaleMessage(locale, messages);
		await nextTick();
	}
	localStorage.setItem(LOCALE_KEY, JSON.stringify(locale));
	(i18n.global.locale as WritableComputedRef<string>).value = locale;
	/**
	 * NOTE:
	 * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
	 * The following is an example for axios.
	 *
	 * axios.defaults.headers.common['Accept-Language'] = locale
	 */
	document.querySelector('html')?.setAttribute('lang', locale);
};
