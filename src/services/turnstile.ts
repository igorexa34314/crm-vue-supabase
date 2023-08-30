import { supabase } from '@/supabase';
import { errorHandler } from '@/utils/errorHandler';

export class TurnstileService {
	static async validateToken(token: string) {
		const { data, error } = await supabase.functions.invoke('cloudflare-turnstile', {
			body: { token },
		});
		if (error) return errorHandler(error);
		return JSON.parse(data);
	}
}
