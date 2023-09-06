import { errorHandler } from '@/utils/errorHandler';
import { DEFAULT_CURRENCY, availableCurrencies } from '@/globals';

export type CurrencyRates = (typeof availableCurrencies)[number];
export interface Currency {
	rates: Record<CurrencyRates, number>;
	date: Date;
}

export const DEFAULT_CURRENCY_RESPONSE = {
	rates: { [DEFAULT_CURRENCY]: 1 },
	date: new Date(),
} as Currency;

export class CurrencyService {
	static async fetchCurrency() {
		const currenciesToFetch = availableCurrencies.join('%2C');
		return fetch(import.meta.env.VITE_EXCHANGER_API_URL + `?base=${DEFAULT_CURRENCY}&symbols=${currenciesToFetch}`, {
			method: 'GET',
			redirect: 'follow',
			headers: new Headers({
				'Content-Type': 'application/json',
			}),
		})
			.then(response => response.json())
			.then((result: Currency) => result || DEFAULT_CURRENCY_RESPONSE)
			.catch(error => errorHandler(error));
	}
}
