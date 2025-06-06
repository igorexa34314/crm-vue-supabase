import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/config/supabase';

export const fetchLocaleTranslation = async (locale: string = 'en-US') => {
	const { error, data } = await supabase
		.from('locales')
		.select('translations')
		.eq('code', locale)
		.single();
	if (error) throw errorHandler(error);
	if (
		!data.translations ||
		typeof data.translations !== 'object' ||
		Array.isArray(data.translations)
	) {
		throw new Error('Invalid translation format');
	}
	return data.translations;
};

export const fetchAvailableLocales = async () => {
	const { error, data } = await supabase.from('locales').select('code, name, native_name');
	if (error) throw errorHandler(error);
	return data;
};
