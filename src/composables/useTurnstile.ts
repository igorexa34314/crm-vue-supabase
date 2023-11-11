import { ref, onBeforeUnmount } from 'vue';
import { useScriptTag } from '@vueuse/core';
import { loadTurnstileCbName, turnstileScriptSrc, TURNSTILE_SITE_KEY } from '@/global-vars';
import type { Container } from 'turnstile-types';

export const useTurnstile = (selector: Container) => {
	let turnstileId: string;

	const turnstileToken = ref('');

	useScriptTag(
		turnstileScriptSrc,
		// on script tag loaded.
		() => {
			(window as typeof window & { [loadTurnstileCbName]: () => void })[loadTurnstileCbName] = () => {
				turnstileId = window.turnstile.render(selector, {
					sitekey: TURNSTILE_SITE_KEY,
					size: 'normal',
					'refresh-expired': 'manual',
					callback: token => (turnstileToken.value = token),
				});
			};
		},
		{ defer: true }
	);

	onBeforeUnmount(() => {
		window.turnstile.remove(turnstileId);
	});

	return turnstileToken;
};
