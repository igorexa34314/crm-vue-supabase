import { createRouter, createWebHistory } from 'vue-router';
import { routes, handleHotUpdate } from 'vue-router/auto-routes';
import { checkAuth } from '@/middleware/auth';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
	scrollBehavior: (to, from, savedPosition) => {
		if (to.path === from.path && to.query) {
			return;
		}
		return savedPosition || { top: 0 };
	},
});

router.beforeEach(checkAuth);

// This will update routes at runtime without reloading the page
if (import.meta.hot) {
	handleHotUpdate(router);
}

export default router;

declare module 'vue-router' {
	export interface RouteMeta {
		requiresAuth?: boolean;
		auth?: boolean;
	}
}
