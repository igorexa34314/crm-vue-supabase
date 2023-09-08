/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
import { GlobalComponents } from 'vue';
import AppLoader from '@/components/app/AppLoader.vue';

declare module 'vue' {
	export interface GlobalComponents {
		AppLoader: typeof AppLoader;
	}
}
