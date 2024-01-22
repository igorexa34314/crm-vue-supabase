import { ref, onBeforeUnmount, toValue, type MaybeRefOrGetter } from 'vue';
import { useScriptTag } from '@vueuse/core';
import { loadTurnstileCbName, turnstileScriptSrc, TURNSTILE_SITE_KEY } from '@/global-vars';
import type { ElementId } from 'turnstile-types';

export const useTurnstile = (selector: MaybeRefOrGetter<HTMLElement | ElementId>) => {
	let turnstileId: string;

	const turnstileToken = ref('');

	useScriptTag(
		turnstileScriptSrc,
		// on script tag loaded.
		() => {
			window[loadTurnstileCbName] = () => {
				turnstileId = turnstile.render(toValue(selector), {
					sitekey: TURNSTILE_SITE_KEY,
					size: 'normal',
					'refresh-expired': 'manual',
					theme: 'auto',
					callback: token => (turnstileToken.value = token),
				});
			};
		},
		{ defer: true }
	);

	onBeforeUnmount(() => {
		turnstile.remove(turnstileId);
	});

	return turnstileToken;
};
