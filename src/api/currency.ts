import fetch from 'cross-fetch';
import { errorHandler } from '@/utils/errorHandler';
import { EXCHANGER_API_URL, EXCHANGER_API_KEY, availableCurrencies, SERVER_CURRENCY } from '@/global-vars';

export type CurrencyRates = (typeof availableCurrencies)[number];
export interface Currency {
	rates: Record<CurrencyRates, number>;
	date: Date;
}

const FALLBACK_CURRENCY_RESPONSE = {
	rates: { [SERVER_CURRENCY]: 1 },
	date: new Date(),
};

type API_RESPONSE_SUCCESS<Base extends string = 'USD'> = {
	base_code: Base;
	conversion_rates: Record<string, number>;
	result: 'success';
	time_last_update_utc: string;
	time_next_update_utc: string;
};

interface API_RESPONSE_ERROR {
	result: 'error';
	'error-type': string;
}

export const fetchCurrency = async <Base extends string = typeof SERVER_CURRENCY>(base: Base): Promise<Currency> => {
	try {
		const response = await fetch(`${EXCHANGER_API_URL}/${base}`, {
			method: 'GET',
			headers: new Headers({
				Authorization: `Bearer ${EXCHANGER_API_KEY}`,
			}),
		});
		const result: API_RESPONSE_SUCCESS<Base> = await response.json();

		const { conversion_rates, time_last_update_utc } = result;
		if (conversion_rates && time_last_update_utc) {
			return {
				date: new Date(time_last_update_utc),
				rates: availableCurrencies.reduce(
					(rates, c) => ({ ...rates, [c]: conversion_rates[c] }),
					{} as Record<CurrencyRates, number>
				),
			};
		}
		return FALLBACK_CURRENCY_RESPONSE as Currency;
	} catch (error) {
		if ((error as unknown as API_RESPONSE_ERROR)?.result === 'error') {
			errorHandler((error as unknown as API_RESPONSE_ERROR)['error-type']);
		} else {
			errorHandler(error);
		}
		return FALLBACK_CURRENCY_RESPONSE as Currency;
	}
};
