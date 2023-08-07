import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router';
import { setupLayouts } from 'virtual:generated-layouts';
import { checkAuth } from '@/middlewares/auth';
import generatedRoutes from '~pages';

const history = import.meta.env.SSR ? createMemoryHistory(import.meta.env.BASE_URL) : createWebHistory(import.meta.env.BASE_URL);
const routes = setupLayouts(generatedRoutes);

const router = createRouter({
	history,
	routes
});

router.beforeEach(async (to, from, next) => {
	await checkAuth(to, from, next);
});

export default router;
