/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
/**
 * you need to import the some interfaces
 */
import { DefineLocaleMessage, DefineDateTimeFormat, DefineNumberFormat } from 'vue-i18n';
import { availableLocales } from '@/global-vars';
import datetimeFormats from '@/utils/datetimeFormats.json';
import enUS from '@/locales/en-US.json';

declare module 'vue-i18n' {
	// define the locale messages schema
	export type localeKey = (typeof availableLocales)[number];
	export type MessageSchema = typeof enUS;
	export type DateTimeFormatSchema = typeof datetimeFormats;

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
