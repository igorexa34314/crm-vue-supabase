import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { DEFAULT_LOCALE, SERVER_CURRENCY, LOCALE_KEY } from '@/global-vars';
import { UserInfo } from '@/services/user';

export const useUserStore = defineStore('user', () => {
	const info = ref<UserInfo | null>(null);

	const isLocaleLoading = ref(false);

	const setInfo = (data: UserInfo) => {
		info.value = data;
	};
	const $reset = () => {
		info.value = null;
	};
	const userCurrency = computed(() => info.value?.currency || SERVER_CURRENCY);

	const fallbackUserCurrency = () => {
		setInfo({ ...(info.value as UserInfo), currency: SERVER_CURRENCY });
	};

	const setLocale = () => {
		setInfo({
			...(info.value as UserInfo),
			locale: JSON.parse(localStorage.getItem(LOCALE_KEY) || 'null') || DEFAULT_LOCALE,
		});
	};

	const getUserCurrency = computed(() => info.value?.currency || SERVER_CURRENCY);

	const $subscribeLocale = (cb: (newLocale: string) => void | Promise<void>) => {
		return watch(
			() => info.value?.locale,
			async newVal => {
				if (newVal) {
					await cb(newVal);
				}
			}
		);
	};

	const $subscribeCurrency = (callback: (newCurrency: UserInfo['currency']) => void | Promise<void>) => {
		return watch(
			() => info.value?.currency,
			async newVal => {
				if (newVal) {
					await callback(newVal);
				}
			}
		);
	};

	return {
		info,
		isLocaleLoading,
		userCurrency,
		getUserCurrency,
		setInfo,
		fallbackUserCurrency,
		$reset,
		$subscribeLocale,
		$subscribeCurrency,
		setLocale,
	};
});
