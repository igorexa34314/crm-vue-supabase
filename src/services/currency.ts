import { errorHandler } from '@/utils/errorHandler';
import { SERVER_CURRENCY, availableCurrencies } from '@/global-vars';

export type CurrencyRates = (typeof availableCurrencies)[number];
export interface Currency {
	rates: Record<CurrencyRates, number>;
	date: Date;
}

export const DEFAULT_CURRENCY_RESPONSE = {
	rates: { [SERVER_CURRENCY]: 1 },
	date: new Date(),
} as Currency;

export class CurrencyService {
	static async fetchCurrency(base: CurrencyRates = SERVER_CURRENCY) {
		const currenciesToFetch = availableCurrencies.join('%2C');
		return fetch(import.meta.env.VITE_EXCHANGER_API_URL + `?base=${base}&symbols=${currenciesToFetch}`, {
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
