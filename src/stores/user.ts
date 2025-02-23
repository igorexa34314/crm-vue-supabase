import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed, readonly, shallowRef } from 'vue';
import { serverCurrency } from '@/constants/currency';
import { defaultLocale, localeKey } from '@/constants/i18n';
import type { UserInfo } from '@/api/user';

export const useUserStore = defineStore('user', () => {
	const info = shallowRef<UserInfo | null>(null);

	const setInfo = (data: Partial<UserInfo>) => {
		info.value = { ...((info.value || {}) as UserInfo), ...data };
	};
	const $reset = () => {
		info.value = null;
	};

	const userCurrency = computed(() => info.value?.currency || serverCurrency);

	const resetUserCurrency = () => {
		setInfo({ ...info.value, currency: serverCurrency });
	};

	const setLocale = () => {
		setInfo({
			...info.value,
			locale: JSON.parse(localStorage.getItem(localeKey) || 'null') || defaultLocale,
		});
	};

	return {
		info: readonly(info),
		userCurrency,
		setInfo,
		setLocale,
		resetUserCurrency,
		$reset,
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
