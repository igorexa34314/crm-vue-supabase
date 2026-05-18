import { fetchCurrency } from '@/api/currency';
import type { UserInfo } from '@/api/user';
import { useUserStore } from '@/stores/user';
import { defineQuery, defineQueryOptions, useQuery, useQueryState } from '@pinia/colada';
import { useI18n } from 'vue-i18n';

export const currencyQuery = defineQueryOptions((currency: UserInfo['currency']) => ({
	key: ['currency', currency],
	query: () => fetchCurrency(currency),
}));

export const useCurrencyQuery = defineQuery(() => {
	const userStore = useUserStore();
	const { t, te } = useI18n({ useScope: 'global' });

	const query = useQuery(() => ({
		...currencyQuery(userStore.userCurrency),
		meta: {
			errorMessage: e =>
				te(`warnings.${e.message}`) ? t(`warnings.${e.message}`) : t('error_loading_currency'),
		},
	}));

	return query;
});

export function useCurrencyQueryState() {
	const userStore = useUserStore();

	return useQueryState(() => currencyQuery(userStore.userCurrency).key);
}
