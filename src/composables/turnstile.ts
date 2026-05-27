/// <reference types="@types/cloudflare-turnstile" />
import { useScript, type UseScriptOptions } from '@unhead/vue';

declare global {
	interface Window {
		// @types/cloudflare-turnstile doesn't provide full api
		turnstile: Turnstile.Turnstile;
		onloadTurnstileCallback: () => void;
	}
}

const scriptSrc =
	import.meta.env.VITE_TURNSTILE_SCRIPT_SRC ||
	'https://challenges.cloudflare.com/turnstile/v0/api.js';

export function useScriptCloudflareTurnstile(options?: UseScriptOptions<Turnstile.Turnstile>) {
	return useScript<Turnstile.Turnstile>(scriptSrc, {
		use: () => window.turnstile,
		...options,
	});
}
