import { defineStore, acceptHMRUpdate } from 'pinia';
import { watch } from 'vue';
import { useTheme } from 'vuetify';
import { useLocalStorage } from '@vueuse/core';

const DARK_MODE_KEY = 'dark-mode';

export const useDarkModeStore = defineStore(DARK_MODE_KEY, () => {
	const theme = useTheme();
	const darkMode = useLocalStorage<boolean>(DARK_MODE_KEY, theme.global.current.value.dark);

	watch(
		darkMode,
		newVal => {
			if (newVal) {
				theme.change('dark');
			} else {
				theme.change('light');
			}
		},
		{ immediate: true }
	);

	return { darkMode };
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useDarkModeStore, import.meta.hot));
}
