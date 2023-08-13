import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/supabase';

export class LocaleService {
	static async fetchLocaleTranslation(locale: string = 'en-US') {
		try {
			const { error, data } = await supabase.from('locales').select('translations').eq('code', locale).single();
			if (error) throw error;
			return data.translations;
		} catch (err) {
			errorHandler(err);
		}
	}

	static async fetchAvailableLocales() {
		try {
			const { error, data: locales } = await supabase.from('locales').select('code, name, native_name');
			if (error) throw error;
			return locales;
		} catch (err) {
			errorHandler(err);
		}
	}
}
