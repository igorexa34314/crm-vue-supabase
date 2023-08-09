import { DbResultErr } from '@/database.types';

export const errorHandler = (err: unknown, msg?: string) => {
	if (err instanceof Error) {
		const errorMessage = err.message;
		// The email of the user's account used.
		console.error(errorMessage, msg);
		throw errorMessage;
	}
	throw err;
};
