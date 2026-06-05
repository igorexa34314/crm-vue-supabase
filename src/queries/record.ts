import { fetchRecordById, fetchRecordsWithCategory, type Record } from '@/api/record';
import { defineQuery, useQuery } from '@pinia/colada';
import { useRouteQuery } from '@vueuse/router';
import { defaultRecordsPerPage } from '@/constants/app';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

export const useRecordByIdQuery = defineQuery(() => {
	const { t } = useI18n();
	const route = useRoute('//records/[id]');

	return useQuery({
		key: () => ['record', { id: route.params.id }],
		query: () => fetchRecordById(route.params.id),
		meta: {
			errorMessage: () => t('no_record_found'),
		},
	});
});

export const useRecordsWithCategoryQuery = defineQuery(() => {
	const { t } = useI18n();

	// Init Records table pagination and sorting
	const page = useRouteQuery<string, number>('page', '1', {
		transform: {
			get: v => Number.parseInt(v),
			set: v => v.toString(),
		},
	});
	const perPage = useRouteQuery<string, number>('perPage', defaultRecordsPerPage.toString(), {
		transform: {
			get: v => Number.parseInt(v),
			set: v => v.toString(),
		},
	});
	const sortKey = useRouteQuery<string | undefined, keyof Record | undefined>('sort', undefined, {
		transform: v => {
			if (!v || !isRecordProperty(v)) {
				return undefined;
			}
			return v;
		},
	});

	const sortOrder = useRouteQuery('order', undefined, {
		transform: v => (!v || v === 'desc' ? 'desc' : 'asc'),
	});

	const query = useQuery({
		key: () => [
			'records',
			{ withCategory: true },
			{
				page: page.value,
				perPage: perPage.value,
				order: sortOrder.value,
				sortBy: sortKey.value,
			},
		],
		query: async () => {
			const { records, count } = await fetchRecordsWithCategory({
				page: page.value,
				perPage: perPage.value,
				order: sortOrder.value,
				sortBy: sortKey.value,
			});
			return { records, totalRecords: count || records.length };
		},
		placeholderData: previousData => previousData ?? { records: [], totalRecords: 0 },
		meta: {
			errorMessage: () => t('error_loading_records_or_categories'),
		},
	});

	return { ...query, page, perPage, sortKey, sortOrder };
});

export function isRecordProperty(prop: string): prop is keyof Record {
	return (
		[
			'id',
			'amount',
			'description',
			'type',
			'updated_at',
			'created_at',
		] as const satisfies (keyof Record)[]
	).some(field => field === prop);
}
