import { loadTurnstileCbName } from './global-vars';
import { TurnstileObject } from 'turnstile-types';

declare global {
	interface Window {
		[loadTurnstileCbName]: () => void;
	}

	declare const turnstile: TurnstileObject;
}
