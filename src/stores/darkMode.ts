import { defineStore } from 'pinia';
import { watch } from 'vue';
import { useTheme } from 'vuetify';
import { useLocalStorage, type RemovableRef } from '@vueuse/core';
import { DARK_MODE_KEY } from '@/global-vars';

export const useDarkModeStore = defineStore(DARK_MODE_KEY, () => {
	const theme = useTheme();
	const darkMode: RemovableRef<boolean> = useLocalStorage<boolean>(DARK_MODE_KEY, theme.global.current.value.dark);

	watch(
		darkMode,
		newVal => {
			theme.global.name.value = newVal ? 'dark' : 'light';
		},
		{ immediate: true }
	);

	return { darkMode };
});
