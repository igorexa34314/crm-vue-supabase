import { computed, inject } from 'vue';
import { currencyKey } from '@/injection-keys';
import { useInfoStore } from '@/stores/info';
import { CurrencyRates } from '@/services/currency';

export const useCurrencyFilter = () => {
	const { currency } = inject(currencyKey)!;

	const infoStore = useInfoStore();

	const currencyFilter = computed(
		() =>
			(amount: number, currencyType?: CurrencyRates, type: 'direct' | 'reverse' = 'direct') => {
				if (!currencyType) {
					currencyType = infoStore.info?.currency || 'USD';
				}
				if (currency.value && Object.keys(currency.value).length) {
					return +(
						type === 'direct'
							? amount * currency.value.rates[currencyType]
							: amount / currency.value.rates[currencyType]
					).toFixed(2);
				}
				return amount;
			}
	);

	return { cf: currencyFilter };
};
