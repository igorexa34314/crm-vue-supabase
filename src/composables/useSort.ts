import { MaybeRef, Ref, ref, unref, watchEffect, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { SortType, SortFields } from '@/services/record';

export const useSort = <T extends { [key: string]: any }, K extends keyof T>(
	items: MaybeRef<T[] | undefined>,
	initialField: K
) => {
	const { push } = useRouter();
	const route = useRoute();

	const isRightPropInQuery = Object.keys(unref(items)?.at(0) || {}).includes(route.query.sort as string);

	const sortState = ref({
		field: isRightPropInQuery ? (route.query.sort as K) : initialField,
		type: ['asc', 'desc'].includes(route.query.by as string) ? (route.query.by as SortType) : 'desc'
	}) as Ref<{ field: K; type: SortType }>;

	const sortRecords = async (field: K) => {
		return new Promise((resolve: (field: K, type: SortType) => void) => {
			let sType: SortType = 'desc';
			if (field === sortState.value.field) {
				sType = sortState.value.type === 'asc' ? 'desc' : 'asc';
			}
			resolve(field, sType);
			sortState.value = { field, type: sType };
		});
	};

	watchEffect(async () => {
		push({ query: { ...route.query, sort: sortState.value.field as string, by: sortState.value.type } });
	});

	onUnmounted(() => push({ query: undefined }));

	return { sortState, sortRecords };
};
