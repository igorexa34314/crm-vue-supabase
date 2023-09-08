import { onMounted, onUnmounted } from 'vue';
import { SITE_KEY } from '@/global-vars';

let turnstileToken: string;

export const useTurnStile = (selector: string) => {
	let turnstileId: string;

	onMounted(() => {
		(window as Window & typeof globalThis & { onloadTurnstileCallback: () => void }).onloadTurnstileCallback = () => {
			turnstileId = window.turnstile.render(selector, {
				sitekey: SITE_KEY,
				size: 'normal',
				'refresh-expired': 'manual',
				callback: token => (turnstileToken = token),
			});
		};
	});

	onUnmounted(() => {
		window.turnstile.remove(turnstileId);
	});

	return turnstileToken;
};
