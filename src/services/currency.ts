import { errorHandler } from '@/utils/errorHandler';
import { DEFAULT_CURRENCY } from '@/globals';

export type CurrencyRates = 'USD' | 'EUR' | 'UAH' | 'RUB';
export interface Currency {
	rates: Record<CurrencyRates, number>;
	date: Date;
}

const DEFAULT_CURRENCY_RESPONSE = {
	rates: { [DEFAULT_CURRENCY]: 1 },
	date: new Date(),
};

export class CurrencyService {
	static async fetchCurrency() {
		return fetch(import.meta.env.VITE_EXCHANGER_API_URL + `?base=${DEFAULT_CURRENCY}&symbols=EUR%2CUAH%2CUSD%2CRUB`, {
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
