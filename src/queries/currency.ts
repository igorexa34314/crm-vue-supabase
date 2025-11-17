import { fetchCurrency, type Currency } from '@/api/currency';
import { useSnackbarStore } from '@/stores/snackbar';
import { useUserStore } from '@/stores/user';
import { defineQuery, useQuery, useQueryState } from '@pinia/colada';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

const createCurrencyKey = (userCurrency: string) => ['currency', userCurrency];

export const useCurrencyQuery = defineQuery(() => {
	const userStore = useUserStore();
	const { t, te } = useI18n({ useScope: 'global' });
	const { showMessage } = useSnackbarStore();

	const query = useQuery({
		key: () => createCurrencyKey(userStore.userCurrency),
		query: () => fetchCurrency(userStore.userCurrency),
	});

	watch(query.error, e => {
		if (e) {
			showMessage(
				te(`warnings.${e.message}`) ? t(`warnings.${e.message}`) : t('error_loading_currency'),
				'red-darken-3'
			);
			userStore.resetUserCurrency();
		}
	});

	return query;
});

export function useCurrencyQueryState() {
	const userStore = useUserStore();

	return useQueryState<Currency>(() => createCurrencyKey(userStore.userCurrency));
}
