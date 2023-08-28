import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/supabase';

export class LocaleService {
	static async fetchLocaleTranslation(locale: string = 'en-US') {
		const { error, data } = await supabase.from('locales').select(`translations`).eq('code', locale).single();
		if (error) return errorHandler(error);
		return data.translations;
	}

	static async fetchAvailableLocales() {
		const { error, data: locales } = await supabase.from('locales').select(`code, name, native_name`);
		if (error) return errorHandler(error);
		return locales;
	}
}
