declare module '@pinia/colada' {
	interface TypesConfig {
		queryMeta: {
			errorMessage?: (err: Error) => string | string;
		};
	}
}

export {};
