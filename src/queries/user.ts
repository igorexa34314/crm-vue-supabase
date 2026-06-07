import { getUserInfo, subscribeUserInfo } from '@/api/user';
import { serverCurrency } from '@/constants/currency';
import {
	defineQuery,
	defineQueryOptions,
	useQuery,
	useQueryCache,
	useQueryState,
} from '@pinia/colada';
import { computed } from 'vue';

export const userInfoQuery = defineQueryOptions({
	key: ['user-info'],
	query: () => getUserInfo(),
});

export const useUserInfoQuery = defineQuery(() => {
	const { data, ...query } = useQuery(userInfoQuery);

	const userInfo = computed(() => data.value ?? null);
	const userCurrency = computed(() => data.value?.currency || serverCurrency);

	return { ...query, data, userInfo, userCurrency };
});

export function useUserInfoQueryState() {
	const { data, ...query } = useQueryState(userInfoQuery.key);

	const userInfo = computed(() => data.value ?? null);
	const userCurrency = computed(() => data.value?.currency || serverCurrency);

	return { ...query, data, userInfo, userCurrency };
}

export const useUserInfoRealtimeSubscription = async () => {
	const queryCache = useQueryCache();

	return subscribeUserInfo(userInfo => {
		const entry = queryCache.get(userInfoQuery.key);

		if (entry && entry.asyncStatus.value !== 'loading') {
			queryCache.setQueryData(userInfoQuery.key, userInfo);
		}
	});
};
