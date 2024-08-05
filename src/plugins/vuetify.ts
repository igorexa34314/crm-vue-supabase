// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
// I18n
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';
import { useI18n, type I18n } from 'vue-i18n';

const defaultTheme = import.meta.env.VITE_APP_DEFAULT_THEME || 'light';

export default function setupVuetify<T extends I18n<any, any, any, any, false>>(i18n: T) {
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
		theme: {
			defaultTheme,
			themes: {
				dark: {
					dark: true,
					colors: {
						'card-1': '#5e5a66',
						'card-2': '#575757',
						panel: '#424242',
						switch: '#ffffff',
						progress: '#ffffff',
						tooltip: '#46424f',
						'file-icon': '#B388FF',
						fixed: '#8b79ee',
						title: '#E0E0E0',
						subtitle: '#E0E0E0',
						input: '#EFEBE9',
						background: '#282828',
						success: '#46424f',
						radio: '#E8EAF6',
						profile: '#BDBDBD',
						sidebar: '#37474F',
						hover: '#37474f33',
						surface: '#282828',
						primary: '#E0E0E0',
						divider: '#E0E0E0',
						trend: '#E0E0E0',
						secondary: '#37474F',
						navbar: '#263238',
					},
				},
				light: {
					dark: false,
					colors: {
						background: '#F8F6F4',
						'card-1': '#99DBF5',
						'card-2': '#FFEEBB',
						panel: '#C8E6C9',
						title: '#2C3333',
						switch: '#000000',
						progress: '#000000',
						subtitle: '#393646',
						sidebar: '#DEF5E5',
						'file-icon': '#D4E157',
						tooltip: '#FFE1E1',
						input: '#000000',
						radio: '#FF9100',
						hover: '#ffffff66',
						fixed: '#FDCEDF',
						primary: '#393646',
						divider: '#BCAAA4',
						navbar: '#ECB365',
						profile: '#261C2C',
						trend: '#FFFFFF',
						success: '#4E9F3D',
					},
				},
			},
		},
	});
}
