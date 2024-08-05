export const availableCurrencies = ['USD', 'EUR', 'RUB', 'UAH'] as const;
export const serverCurrency = (import.meta.env.VITE_SERVER_CURRENCY || 'USD') as (typeof availableCurrencies)[number];
