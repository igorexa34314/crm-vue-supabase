import { ref, toValue, type MaybeRefOrGetter, onMounted, onUnmounted } from 'vue';
import { useScriptTag } from '@vueuse/core';

const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export const useTurnstile = (selector: MaybeRefOrGetter<string | HTMLElement>) => {
	let turnstileId: string | null = null;

	const turnstileToken = ref('');

	const { load, unload } = useScriptTag(
		`${import.meta.env.VITE_TURNSTILE_SCRIPT_SRC}?render=explicit&onload=onloadTurnstileCallback`,
		// on script tag loaded.
		() => {
			window.onloadTurnstileCallback = () => {
				turnstileId =
					turnstile.render(toValue(selector), {
						sitekey,
						size: 'normal',
						'refresh-expired': 'manual',
						theme: 'auto',
						callback: token => {
							turnstileToken.value = token;
						},
					}) ?? null;
			};
		},
		{ defer: true, manual: true }
	);

	onMounted(() => {
		load();
	});

	onUnmounted(() => {
		if (turnstileId) {
			turnstile.remove(turnstileId);
		}
		unload();
	});

	return turnstileToken;
};

declare global {
	interface Window {
		onloadTurnstileCallback: () => void;
	}
}
