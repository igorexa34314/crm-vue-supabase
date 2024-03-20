import { VueQueryPlugin } from '@tanstack/vue-query';
import type { VueQueryPluginOptions } from '@tanstack/vue-query';

const createVueQuery = (options?: VueQueryPluginOptions): typeof VueQueryPlugin => ({
	...VueQueryPlugin,
	install: (app, _opts) => VueQueryPlugin.install(app, { ...options, ..._opts }),
});

export default createVueQuery({
	queryClientConfig: {
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
			},
		},
	},
});
