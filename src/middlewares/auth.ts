import { getCurrentUser } from 'vuefire';
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';

export const checkAuth = async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
	const currentUser = await getCurrentUser();
	const requireAuth = to.matched.some(record => record.meta.auth);
	if (requireAuth && !currentUser) {
		next({ path: '/login', query: { message: 'login' } });
	} else if (!requireAuth && currentUser) {
		next({ path: '/' });
	}
	else next();
};
