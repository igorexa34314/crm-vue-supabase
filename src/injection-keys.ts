import { InjectionKey } from 'vue';
import { Currency } from '@/services/currency';
import { UseAsyncStateReturn } from '@vueuse/core';

type CurrencyAPIResult = UseAsyncStateReturn<Currency | null | undefined, [], true>;

export interface CurrencyReturn extends Pick<CurrencyAPIResult, 'isLoading' | 'isReady'> {
	currency: CurrencyAPIResult['state'];
	refresh: CurrencyAPIResult['execute'];
}

export const currencyKey = Symbol('currency') as InjectionKey<CurrencyReturn>;
