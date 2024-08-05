import { createRouter, createWebHistory } from 'vue-router';
import { routes, handleHotUpdate } from 'vue-router/auto-routes';
import { setupLayouts } from 'virtual:generated-layouts';
import { checkAuth } from '@/middleware/auth';

const router = createRouter({
	routes: setupLayouts(routes),
	history: createWebHistory(import.meta.env.BASE_URL),
	scrollBehavior: (to, from, savedPosition) => {
		if (to.path === from.path && to.query) {
			return;
		}
		return savedPosition || { top: 0 };
	},
});

router.beforeEach(checkAuth);

export default router;

// This will update routes at runtime without reloading the page
if (import.meta.hot) {
	handleHotUpdate(router);
}
