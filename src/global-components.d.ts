import AppLoader from '@/components/app/AppLoader.vue';

declare module '@vue/runtime-core' {
	export interface GlobalComponents {
		AppLoader: typeof AppLoader;
	}
}
