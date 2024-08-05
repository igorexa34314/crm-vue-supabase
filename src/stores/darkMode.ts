import { defineStore } from 'pinia';
import { watch } from 'vue';
import { useTheme } from 'vuetify';
import { useLocalStorage } from '@vueuse/core';

const DARK_MODE_KEY: string = import.meta.env.VITE_APP_DARK_MODE_KEY || 'darkMode';

export const useDarkModeStore = defineStore(DARK_MODE_KEY, () => {
	const theme = useTheme();
	const darkMode = useLocalStorage<boolean>(DARK_MODE_KEY, theme.global.current.value.dark);

	watch(
		darkMode,
		newVal => {
			theme.global.name.value = newVal ? 'dark' : 'light';
		},
		{ immediate: true }
	);

	return { darkMode };
});
