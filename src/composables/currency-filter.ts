import { computed, inject } from 'vue';
import { currencyKey, type CurrencyReturn } from '@/injection-keys';
import type { CurrencyRates } from '@/api/currency';
import { serverCurrency } from '@/constants/currency';

export const useCurrencyFilter = () => {
	const { currency } = inject(currencyKey, {} as CurrencyReturn);

	const currencyFilter = computed(
		() =>
			(amount: number, options?: { currency?: CurrencyRates; type?: 'direct' | 'reverse' }) => {
				// If no currencies or default currency response
				if (currency.value?.rates || Object.keys(currency.value?.rates || {}).length <= 1) {
					return amount;
				}

				const currencyRate = 1 / currency.value!.rates[options?.currency || serverCurrency];

				return +(
					options?.type !== 'reverse' ? amount * currencyRate : amount / currencyRate
				).toFixed(2);
			}
	);

	return currencyFilter;
};
