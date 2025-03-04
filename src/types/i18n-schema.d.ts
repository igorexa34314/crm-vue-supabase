/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
import { DefineLocaleMessage, DefineDateTimeFormat, DefineNumberFormat } from 'vue-i18n';

declare module 'vue-i18n' {
	// define the locale messages schema
	export type LocaleKey = (typeof import('@/constants/i18n'))['availableLocales'][number];
	export type MessageSchema = typeof import('@/locales/en-US.json');
	export type DateTimeFormatSchema = (typeof import('@/constants/i18n'))['datetimeFormats'];

	export interface DefineLocaleMessage extends MessageSchema {}

	// define the datetime format schema
	export interface DefineDateTimeFormat extends DateTimeFormatSchema {}

	// define the number format schema
	export interface DefineNumberFormat {
		currency: {
			style: 'currency';
			currency: string;
			useGrouping: true;
			currencyDisplay?: 'symbol';
			notation?: 'standard';
		};
	}
}
