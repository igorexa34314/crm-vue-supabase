import { InjectionKey } from 'vue';
import { UseAsyncStateReturn } from '@vueuse/core';
import { CurrencyService } from '@/services/currency';

type CurrencyAPIResult = UseAsyncStateReturn<
	Awaited<ReturnType<typeof CurrencyService.fetchCurrency>> | null,
	[],
	true
>;

export interface CurrencyReturn extends Pick<CurrencyAPIResult, 'isLoading' | 'isReady'> {
	currency: CurrencyAPIResult['state'];
	refresh: CurrencyAPIResult['execute'];
}

export const currencyKey: InjectionKey<CurrencyReturn> = Symbol('currency');
