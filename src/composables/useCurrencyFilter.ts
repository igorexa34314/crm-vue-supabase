import { computedInject } from '@vueuse/core';
import { currencyKey, CurrencyReturn } from '@/injection-keys';
import { CurrencyRates } from '@/services/currency';
import { SERVER_CURRENCY } from '@/global-vars';

export const useCurrencyFilter = () => {
	const currencyFilter = computedInject(
		currencyKey,
		data => (amount: number, options?: { currency?: CurrencyRates; type?: 'direct' | 'reverse' }) => {
			// If no currencies or default currency response
			if (!data?.currency.value?.rates || Object.keys(data?.currency.value?.rates).length <= 1) {
				return amount;
			}

			const currencyRate = 1 / data.currency.value.rates[options?.currency || SERVER_CURRENCY];

			return +(options?.type !== 'reverse' ? amount * currencyRate : amount / currencyRate).toFixed(2);
		},
		{} as CurrencyReturn
	);

	return currencyFilter;
};
