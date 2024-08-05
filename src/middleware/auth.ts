import { getCurrentUser } from '@/api/auth';
import type { NavigationGuard } from 'vue-router';

export const checkAuth: NavigationGuard = async (to, from) => {
	if (to.path === from.path && from.query.message) {
		return true;
	}

	const user = await getCurrentUser();
	const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

	if (requiresAuth && !user) {
		return { path: '/login', query: { message: 'login' } };
	} else if (['/login', '/register'].includes(to.path) && user) {
		return '/';
	}
};
