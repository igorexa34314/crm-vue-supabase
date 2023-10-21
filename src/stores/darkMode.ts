import { defineStore } from 'pinia';
import { watch } from 'vue';
import { useTheme } from 'vuetify';
import { useLocalStorage } from '@vueuse/core';
import { vuetifyThemeNames, DARK_MODE_KEY } from '@/global-vars';

export const useDarkModeStore = defineStore(DARK_MODE_KEY, () => {
	const theme = useTheme();
	const darkMode = useLocalStorage(DARK_MODE_KEY, theme.global.current.value.dark);

	watch(darkMode, newVal => {
		theme.global.name.value = newVal ? vuetifyThemeNames.dark : vuetifyThemeNames.light;
	});

	return { darkMode };
});
