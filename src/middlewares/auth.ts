import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { supabase } from '@/supabase';

export const checkAuth = async (
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
	next: NavigationGuardNext
) => {
	const {
		data: { user }
	} = await supabase.auth.getUser();
	const requireAuth = to.matched.some(record => record.meta.auth);
	if (requireAuth && !user) {
		return next({ path: '/login', query: { message: 'login' } });
	} else if (!requireAuth && user) {
		return next({ path: '/' });
	}
	return next();
};
