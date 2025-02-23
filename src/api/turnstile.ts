import { supabase } from '@/config/supabase';
import { errorHandler } from '@/utils/errorHandler';

export const validateToken = async (token: string) => {
	const { data, error } = await supabase.functions.invoke('cloudflare-turnstile', {
		body: { token },
	});
	if (error) throw errorHandler(error);
	return JSON.parse(data) as { success: boolean };
};
