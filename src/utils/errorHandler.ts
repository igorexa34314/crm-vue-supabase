import type { QueryError } from '@supabase/supabase-js';

export function errorHandler(err: QueryError | unknown, msg?: string) {
	if (err instanceof Error) {
		const messageCode = err.message.toLowerCase().split(' ').join('_');
		return messageCode;
	}
	if (msg) {
		console.error(msg);
	}

	return err;
}
