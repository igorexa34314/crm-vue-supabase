import { MaybeRef, Ref, ref, unref, computed, watchEffect, onUnmounted } from 'vue';
import { orderBy } from 'lodash';
import { useRouter, useRoute } from 'vue-router';

export const useSort = <T extends { [key: string]: any }, K extends keyof T>(
	initialItems: MaybeRef<T[] | undefined>,
	initialProp: K
) => {
	const { push } = useRouter();
	const route = useRoute();

	const isRightPropInQuery = Object.keys(unref(initialItems)?.at(0) || {}).includes(
		route.query.sort as string
	);

	const sortProp = ref<keyof T>(
		isRightPropInQuery ? (route.query.sort as string) : initialProp
	) as Ref<keyof T>;

	const sortType = ref<'asc' | 'desc'>(
		['asc', 'desc'].includes(route.query.by as string)
			? (route.query.by as 'asc' | 'desc')
			: 'desc'
	);

	const sortedRecords = computed(() =>
		orderBy(unref(initialItems), [sortProp.value], sortType.value)
	);

	watchEffect(() => {
		push({ query: { ...route.query, sort: sortProp.value as string, by: sortType.value } });
	});

	const sort = (prop: keyof T) => {
		if (Object.keys(unref(initialItems)?.at(0) || {}).includes(prop.toString())) {
			if (prop === sortProp.value) {
				sortType.value = sortType.value === 'asc' ? 'desc' : 'asc';
			} else {
				sortProp.value = prop;
				sortType.value = 'desc';
			}
			push({ query: { sort: prop as string, by: sortType.value } });
		}
	};

	onUnmounted(() => push({ query: undefined }));

	return { sortProp, sortType, sortedRecords, sort };
};
