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
		return fetch(`${import.meta.env.VITE_EXCHANGER_API_URL}/${base}`, {
			method: 'GET',
			headers: new Headers({
				Authorization: `Bearer ${import.meta.env.VITE_EXCHANGER_API_KEY}`,
			}),
		})
			.then(response => response.json())
			.then(result => {
				const { conversion_rates, time_last_update_utc } = result;
				if (conversion_rates && time_last_update_utc) {
					return {
						date: time_last_update_utc,
						rates: Object.assign({}, ...availableCurrencies.map(c => ({ [c]: conversion_rates[c] }))),
					};
				}
				return DEFAULT_CURRENCY_RESPONSE;
			})
			.catch(error => errorHandler(error));
	}
}
