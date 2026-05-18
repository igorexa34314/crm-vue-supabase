import type { UseQueryEntry } from '@pinia/colada';

declare module '@pinia/colada' {
	interface TypesConfig {
		queryMeta: {
			errorMessage?: (err: Error) => string | string;
			onError?: (err: Error, entry: UseQueryEntry) => void;
		};
	}
}

export {};
