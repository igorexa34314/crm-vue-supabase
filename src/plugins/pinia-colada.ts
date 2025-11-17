import type { Plugin } from 'vue';
import { PiniaColada } from '@pinia/colada';

const piniaColadaPlugin: Plugin = {
	install(app) {
		app.use(PiniaColada, {
			queryOptions: {
				// change the stale time for all queries to 0ms
				staleTime: 0,
			},
			mutationOptions: {
				// add global mutation options here
			},
			plugins: [
				// add Pinia Colada plugins here
			],
		});
	},
};

export default piniaColadaPlugin;
