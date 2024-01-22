import { getCurrentUser } from '@/api/auth';
import type { NavigationGuardWithThis } from 'vue-router/auto';

export const checkAuth: NavigationGuardWithThis<undefined> = async (to, from) => {
	if (to.name === from.name && from.query.message) {
		return true;
	}

	const user = await getCurrentUser();
	const requiresAuth = to.matched.some(record => record.meta.auth || record.meta.requiresAuth);

	if (requiresAuth && !user) {
		return { path: '/login', query: { message: 'login' } };
	} else if (!requiresAuth && user) {
		return { path: '/' };
	}
};
