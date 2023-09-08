import { watchEffect } from 'vue';
import { useTheme } from 'vuetify';
import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { vuetifyThemeNames, DARK_MODE_KEY } from '@/global-vars';

export const useDarkModeStore = defineStore(DARK_MODE_KEY, () => {
	const theme = useTheme();
	const darkMode = useLocalStorage(DARK_MODE_KEY, theme.global.current.value.dark);

	const setDarkMode = (value: boolean) => {
		darkMode.value = value;
	};

	watchEffect(() => {
		theme.global.name.value = darkMode.value ? vuetifyThemeNames.dark : vuetifyThemeNames.light;
	});

	return { darkMode, setDarkMode };
});
