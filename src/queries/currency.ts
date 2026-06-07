import { fetchCurrency } from '@/api/currency';
import type { UserInfo } from '@/api/user';
import { defineQuery, defineQueryOptions, useQuery, useQueryState } from '@pinia/colada';
import { useI18n } from 'vue-i18n';
import { useUserInfoQueryState } from '@/queries/user';

export const currencyQuery = defineQueryOptions((currency: UserInfo['currency']) => ({
	key: ['currency', currency],
	query: () => fetchCurrency(currency),
}));

export const useCurrencyQuery = defineQuery(() => {
	const { userCurrency } = useUserInfoQueryState();
	const { t, te } = useI18n();

	return useQuery(() => ({
		...currencyQuery(userCurrency.value),
		meta: {
			errorMessage: e =>
				te(`warnings.${e.message}`) ? t(`warnings.${e.message}`) : t('error_loading_currency'),
		},
	}));
});

export function useCurrencyQueryState() {
	const { userCurrency } = useUserInfoQueryState();

	return useQueryState(() => currencyQuery(userCurrency.value).key);
}
