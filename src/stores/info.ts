import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { CurrencyRates } from '@/services/currency';
import { Locales } from '@/plugins/i18n';
import { useLocalStorage } from '@vueuse/core';
import { DEFAULT_LOCALE, DEFAULT_CURRENCY, LOCALE_KEY } from '@/globals';

export interface UserInfo {
	email: string;
	bill: number;
	locale: Locales;
	username: string;
	firstName?: string;
	photoURL?: string;
	lastName?: string;
	birthdayDate?: Date;
	gender: 'male' | 'female' | 'unknown';
	bio?: string;
	currency: CurrencyRates;
}

export const useInfoStore = defineStore('info', () => {
	const info = ref<UserInfo | null>(null);

	const setInfo = (data: UserInfo) => {
		info.value = data;
	};
	const $reset = () => {
		info.value = null;
	};
	const userCurrency = computed(() => info.value?.currency || DEFAULT_CURRENCY);

	const setLocale = () => {
		(info.value as Partial<UserInfo>) = {
			...info.value,
			locale: JSON.parse(localStorage.getItem(LOCALE_KEY) || 'null') || DEFAULT_LOCALE
		};
	};

	const $subscribeLocale = (cb: (locale: Locales) => void) => {
		return watch(
			() => info.value?.locale,
			newVal => {
				if (newVal) {
					cb(newVal);
				}
			},
			{ deep: true, immediate: true }
		);
	};

	return {
		info,
		userCurrency,
		setInfo,
		$reset,
		$subscribeLocale,
		setLocale
	};
});
