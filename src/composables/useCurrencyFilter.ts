import { computed, inject } from 'vue';
import { currencyKey } from '@/injection-keys';
import { CurrencyRates } from '@/services/currency';
import { SERVER_CURRENCY } from '@/global-vars';

export const useCurrencyFilter = () => {
	const { currency: currencyRates } = inject(currencyKey)!;

	const currencyFilter = computed(
		() => (amount: number, options?: { currency?: CurrencyRates; type?: 'direct' | 'reverse' }) => {
			// If no currencies or default currency response
			if (!currencyRates.value || Object.keys(currencyRates.value.rates).length <= 1) {
				return amount;
			}

			const currencyRate = 1 / currencyRates.value.rates[options?.currency || SERVER_CURRENCY];

			return +(options?.type !== 'reverse' ? amount * currencyRate : amount / currencyRate).toFixed(2);
		}
	);

	return { cf: currencyFilter };
};
