import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';
import { useI18n, type I18n } from 'vue-i18n';
import { defaultVuetifyTheme, vuetifyThemes } from '@/constants/themes';
import * as breakpoints from '@/constants/breakpoints';

import '@/assets/styles/layers.scss';
import 'vuetify/styles';

export default function setupVuetify(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-object-type
	i18n: I18n<any, {}, {}, string, false>
) {
	return createVuetify({
		locale: {
			adapter: createVueI18nAdapter({ i18n, useI18n }),
		},
		icons: {
			defaultSet: 'mdi',
			aliases,
			sets: {
				mdi,
			},
		},
		display: {
			thresholds: breakpoints.forVuetify,
		},
		theme: {
			defaultTheme: defaultVuetifyTheme,
			themes: vuetifyThemes,
		},
	});
}
