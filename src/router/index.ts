import { createRouter, createWebHistory, createMemoryHistory, type RouteRecordName } from 'vue-router/auto';
import { setupLayouts } from 'virtual:generated-layouts';
import { checkAuth } from '@/middlewares/auth';

const history = import.meta.env.SSR
	? createMemoryHistory(import.meta.env.BASE_URL)
	: createWebHistory(import.meta.env.BASE_URL);

const router = createRouter({
	history,
	extendRoutes: routes => {
		const authRoutes = ['/login', '/register'] as RouteRecordName[];
		routes = routes.map(route => {
			if (!authRoutes.includes(route.name ?? route.path)) {
				return { ...route, meta: { ...route.meta, auth: true, requiresAuth: true } };
			}
			return route;
		});
		return setupLayouts(routes);
	},
});

router.beforeEach(checkAuth);

export default router;
