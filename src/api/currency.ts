import { errorHandler } from '@/utils/errorHandler';
import { availableCurrencies, serverCurrency } from '@/constants/currency';
import { joinURL } from 'ufo';

export type CurrencyRates = (typeof availableCurrencies)[number];
export interface Currency {
	rates: Record<CurrencyRates, number>;
	date: Date;
}

const FALLBACK_CURRENCY_RESPONSE = {
	rates: { [serverCurrency]: 1 },
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

const apiUrl = import.meta.env.VITE_EXCHANGER_API_URL;
const apiKey = import.meta.env.VITE_EXCHANGER_API_KEY;

export const fetchCurrency = async <Base extends string = typeof serverCurrency>(
	base: Base
): Promise<Currency> => {
	try {
		const response = await fetch(joinURL(apiUrl, base), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
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
