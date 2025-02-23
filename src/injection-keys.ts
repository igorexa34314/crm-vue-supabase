import { fetchCurrency } from '@/api/currency';
import type { InjectionKey } from 'vue';
import type { UseAsyncStateReturn } from '@vueuse/core';

type CurrencyAPIResult = UseAsyncStateReturn<
	Awaited<ReturnType<typeof fetchCurrency>> | null,
	[],
	true
>;

export interface CurrencyReturn extends Pick<CurrencyAPIResult, 'isLoading' | 'isReady'> {
	currency: CurrencyAPIResult['state'];
	refresh: CurrencyAPIResult['execute'];
}

export const currencyKey: InjectionKey<CurrencyReturn> = Symbol('currency');
