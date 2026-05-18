import type { Plugin } from 'vue';
import { PiniaColada, type PiniaColadaPlugin } from '@pinia/colada';
import { useSnackbarStore } from '@/stores/snackbar';
import type { I18n } from 'vue-i18n';

const PiniaColadaQueryErrorHandlingPlugin = (i18n: I18n): PiniaColadaPlugin => {
	return ({ queryCache, pinia }) => {
		const { showMessage } = useSnackbarStore(pinia);
		const { t, te } = i18n.global;

		queryCache.$onAction(({ name, args, onError }) => {
			if (name === 'fetch') {
				const [entry] = args;
				onError(error => {
					if (!(error instanceof Error)) {
						return;
					}

					const metaErrorMessage =
						typeof entry.meta.errorMessage === 'function'
							? entry.meta.errorMessage(error)
							: entry.meta.errorMessage;
					const message =
						metaErrorMessage ||
						// @ts-expect-error - Too difficult to type this correctly, we can ignore it for now
						(te(`warnings.${error.message}`) ? t('$vuetify.badge') : error.message);

					showMessage(message, 'red-darken-3');
				});
			}
		});
	};
};

const piniaColadaPlugin: Plugin<I18n> = {
	install(app, i18n) {
		app.use(PiniaColada, {
			queryOptions: {
				// change the stale time for all queries
				staleTime: 30000, // 30 seconds
				refetchOnWindowFocus: false,
			},
			mutationOptions: {
				// add global mutation options here
			},
			plugins: [PiniaColadaQueryErrorHandlingPlugin(i18n)],
		});
	},
};

export default piniaColadaPlugin;
