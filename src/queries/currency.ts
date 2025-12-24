import { fetchCurrency } from '@/api/currency';
import type { UserInfo } from '@/api/user';
import { useSnackbarStore } from '@/stores/snackbar';
import { useUserStore } from '@/stores/user';
import { defineQuery, defineQueryOptions, useQuery, useQueryState } from '@pinia/colada';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

export const currencyQuery = defineQueryOptions((currency: UserInfo['currency']) => ({
	key: ['currency', currency],
	query: () => fetchCurrency(currency),
}));

export const useCurrencyQuery = defineQuery(() => {
	const userStore = useUserStore();
	const { t, te } = useI18n({ useScope: 'global' });
	const { showMessage } = useSnackbarStore();

	const query = useQuery(currencyQuery, () => userStore.userCurrency);

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

	return useQueryState(() => currencyQuery(userStore.userCurrency).key);
}
