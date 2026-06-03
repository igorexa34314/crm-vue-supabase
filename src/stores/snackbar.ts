import { defineStore, acceptHMRUpdate } from 'pinia';
import { shallowRef } from 'vue';

export interface Snackbar {
	text: string;
	color: string;
	timeout: number;
}

export const useSnackbarStore = defineStore('snackbar', () => {
	const snackbar = shallowRef<Snackbar>({ text: '', color: 'snackbar-success', timeout: 2000 });

	const showMessage = (text: string, color: string, timeout: number = 2500) => {
		snackbar.value = { text, color, timeout };
	};

	const showSuccessMessage = (text: string, timeout?: number) => {
		showMessage(text, 'snackbar-success', timeout);
	};

	const showErrorMessage = (text: string, timeout?: number) => {
		showMessage(text, 'snackbar-error', timeout);
	};

	return { snackbar, showMessage, showSuccessMessage, showErrorMessage };
});

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useSnackbarStore, import.meta.hot));
}
