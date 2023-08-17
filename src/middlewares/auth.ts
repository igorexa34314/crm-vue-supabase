import { NavigationGuardWithThis } from 'vue-router/auto';
import { supabase } from '@/supabase';
import { AuthService } from '@/services/auth';

export const checkAuth: NavigationGuardWithThis<undefined> = async (to, from, next) => {
	if (to.name === from.name && from.query.message) {
		return next();
	}
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) AuthService.setUser(user);
	const requiresAuth = to.matched.some(record => record.meta.auth || record.meta.requiresAuth);

	if (requiresAuth && !user) {
		return next({ path: '/login', query: { message: 'login' } });
	} else if (!requiresAuth && user) {
		return next({ path: '/' });
	}
	return next();
};
