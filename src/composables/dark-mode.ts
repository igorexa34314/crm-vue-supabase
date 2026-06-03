import { watch } from 'vue';
import { useTheme } from 'vuetify';
import { useLocalStorage } from '@vueuse/core';

const DARK_MODE_KEY = 'dark-mode';

export function useDarkModePersistence() {
	const theme = useTheme();
	const darkMode = useLocalStorage<boolean>(DARK_MODE_KEY, theme.global.current.value.dark);

	// Apply persisted value on startup
	if (darkMode.value !== theme.global.current.value.dark) {
		theme.change(darkMode.value ? 'dark' : 'light');
	}

	// Persist changes made via theme.change()
	watch(
		() => theme.global.current.value.dark,
		newVal => {
			darkMode.value = newVal;
		}
	);

	// React to external localStorage changes (e.g. another tab)
	watch(darkMode, newVal => {
		if (newVal !== theme.global.current.value.dark) {
			theme.change(newVal ? 'dark' : 'light');
		}
	});

	return darkMode;
}
