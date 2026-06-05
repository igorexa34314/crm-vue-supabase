import { PiniaColadaCachePersister } from '@pinia/colada-plugin-cache-persister';
import { PiniaColada, type PiniaColadaPlugin } from '@pinia/colada';
import { useSnackbarStore } from '@/stores/snackbar';
import type { Plugin } from 'vue';
import type { I18n } from 'vue-i18n';
import type { Pinia } from 'pinia';

const PiniaColadaQueryErrorHandlingPlugin = (i18n: I18n): PiniaColadaPlugin => {
	return ({ queryCache, pinia }) => {
		const { showErrorMessage } = useSnackbarStore(pinia);
		const { t, te } = i18n.global;

		queryCache.$onAction(({ name, args, onError }) => {
			if (name === 'fetch') {
				const [entry] = args;

				onError(error => {
					if (!(error instanceof Error)) {
						return;
					}

					if (entry.meta.onError && typeof entry.meta.onError === 'function') {
						entry.meta.onError(error, entry);
					}

					const metaErrorMessage =
						typeof entry.meta.errorMessage === 'function'
							? entry.meta.errorMessage(error)
							: entry.meta.errorMessage;
					const message =
						metaErrorMessage ||
						(te(`warnings.${error.message}`)
							? // @ts-expect-error - Too difficult to type this correctly, we can ignore it for now
								t(`warnings.${error.message}`)
							: error.message);

					showErrorMessage(message);
				});
			}
		});
	};
};

export default function setupPiniaColadaPlugin(i18n: I18n, pinia?: Pinia): Plugin {
	return <Plugin>{
		install(app) {
			app.use(PiniaColada, {
				pinia,
				queryOptions: {
					// change the stale time for all queries
					staleTime: 30000, // 30 seconds
					refetchOnWindowFocus: true,
					refetchOnReconnect: true,
				},
				mutationOptions: {
					// add global mutation options here
				},
				plugins: [
					PiniaColadaCachePersister({
						// optional
						key: 'pinia-colada-cache',
						debounce: 1000,
						// storage: localStorage,
						// filter: { key: ['todos'] },
					}),
					PiniaColadaQueryErrorHandlingPlugin(i18n),
				],
			});
		},
	};
}
