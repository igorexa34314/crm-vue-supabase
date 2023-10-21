import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Snackbar {
	text: string;
	color: string;
	timeout: number;
}

export const useSnackbarStore = defineStore('snackbar', () => {
	const snackbar = ref<Snackbar>({ text: '', color: 'green-darken-1', timeout: 2000 });

	const showMessage = (
		text: string = 'missing "message".',
		color: string = 'green-darken-1',
		timeout: number = 2500
	) => {
		snackbar.value = { text, color, timeout };
	};

	return { snackbar, showMessage };
});
