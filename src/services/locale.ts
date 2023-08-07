import { errorHandler } from '@/utils/errorHandler';
import { db } from '@/firebase';
import { doc, collection as col, getDoc } from 'firebase/firestore';
import { Locales } from '@/plugins/i18n';

export class LocaleService {
	static async fetchLocale(locale: Locales = 'en-US') {
		try {
			const localeDoc = await getDoc(doc(col(db, 'locales'), locale));
			if (localeDoc.exists()) {
				return localeDoc.data() as { [key: string]: string };
			}
		} catch (e) {
			errorHandler(e);
		}
	}
}
