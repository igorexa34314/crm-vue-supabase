import { watch } from 'vue';
import { useTheme } from 'vuetify';
import { useLocalStorage } from '@vueuse/core';

const DARK_MODE_KEY = 'dark-mode';

export function useDarkModePersistence() {
	const theme = useTheme();
	const darkMode = useLocalStorage<boolean>(DARK_MODE_KEY, theme.global.current.value.dark);

	watch(
		() => theme.global.current.value.dark,
		newVal => {
			darkMode.value = newVal;
		},
		{ immediate: true }
	);

	return darkMode;
}
