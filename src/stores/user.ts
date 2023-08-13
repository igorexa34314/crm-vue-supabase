import { defineStore } from 'pinia';
import { computed, nextTick, ref, watch } from 'vue';
import { Tables } from '@/database.types';
import { useSnackbarStore } from '@/stores/snackbar';
import { DEFAULT_LOCALE, DEFAULT_CURRENCY, LOCALE_KEY } from '@/globals';

export type UserInfo = Omit<Tables<'profiles'>, 'updated_at'>;

export const useUserStore = defineStore('info', () => {
	const info = ref<UserInfo | null>(null);

	const isLocaleLoading = ref(false);

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

	const $subscribeLocale = (cb: (locale: string) => Promise<void>) => {
		return watch(
			() => info.value?.locale,
			async newVal => {
				if (newVal) {
					try {
						isLocaleLoading.value = true;
						await cb(newVal);
					} catch (err) {
						const { showMessage } = useSnackbarStore();
						showMessage('error_loading_locale', 'red-darken-3');
					} finally {
						isLocaleLoading.value = false;
					}
				}
			},
			{ deep: true, immediate: true }
		);
	};

	return {
		info,
		isLocaleLoading,
		userCurrency,
		setInfo,
		$reset,
		$subscribeLocale,
		setLocale
	};
});
