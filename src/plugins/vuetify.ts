// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';

// Components
import { VBtn, VImg, VIcon, VDivider } from 'vuetify/components';
import * as VGrid from 'vuetify/components/VGrid';
import * as VList from 'vuetify/components/VList';
import * as VCard from 'vuetify/components/VCard';
// import * as directives from 'vuetify/directives';

import { vuetifyThemeNames, DEFAULT_THEME } from '@/global-vars';
// I18n
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';
import { I18n, useI18n } from 'vue-i18n';

export default <T extends I18n<any, any, any, any, false>>(i18n: T) => {
	return createVuetify({
		components: { ...VList, ...VCard, ...VGrid, VBtn, VImg, VIcon, VDivider },
		directives: {},
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
			defaultTheme: DEFAULT_THEME,

			themes: {
				[vuetifyThemeNames.dark]: {
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
						trend: '#E0E0E0',
						secondary: '#37474F',
						navbar: '#263238',
					},
				},
				[vuetifyThemeNames.light]: {
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
						navbar: '#ECB365',
						profile: '#261C2C',
						trend: '#FFFFFF',
						success: '#4E9F3D',
					},
				},
			},
		},
	});
};
