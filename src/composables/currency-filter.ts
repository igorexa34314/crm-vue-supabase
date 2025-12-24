import type { CurrencyRates } from '@/api/currency';
import { serverCurrency } from '@/constants/currency';
import { useCurrencyQueryState } from '@/queries/currency';

export const useCurrencyFilter = () => {
	const { data: currency } = useCurrencyQueryState();

	return (amount: number, options?: { currency?: CurrencyRates; type?: 'direct' | 'reverse' }) => {
		// If no currencies or default currency response
		if (currency.value?.rates || Object.keys(currency.value?.rates || {}).length <= 1) {
			return amount;
		}

		const currencyRate = 1 / currency.value!.rates[options?.currency || serverCurrency];

		return +(options?.type !== 'reverse' ? amount * currencyRate : amount / currencyRate).toFixed(
			2
		);
	};
};
