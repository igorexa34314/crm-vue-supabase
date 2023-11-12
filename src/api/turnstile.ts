import { supabase } from '@/supabase';
import { errorHandler } from '@/utils/errorHandler';

export const validateToken = async (token: string) => {
	const { data, error } = await supabase.functions.invoke('cloudflare-turnstile', {
		body: { token },
	});
	if (error) return errorHandler(error);
	return JSON.parse(data);
};
