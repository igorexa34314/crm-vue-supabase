import { recordQuery, fetchRecordById, fetchRecordsWithCategory, type Record } from '@/api/record';
import { useSnackbarStore } from '@/stores/snackbar';
import { defineQuery, useQuery } from '@pinia/colada';
import { useRouteQuery } from '@vueuse/router';
import { defaultRecordsPerPage } from '@/constants/app';
import { watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

export const useRecordByIdQuery = defineQuery(() => {
	const { t } = useI18n({ useScope: 'global' });
	const { showMessage } = useSnackbarStore();
	const route = useRoute('//records/[id]');

	const query = useQuery({
		key: () => ['record', { id: route.params.id }],
		query: () => fetchRecordById(route.params.id),
	});

	watch(query.error, e => {
		if (e) {
			showMessage(t('no_record_found'), 'red-darken-3');
		}
	});

	return query;
});

export const useRecordsWithCategoryQuery = defineQuery(() => {
	const { t } = useI18n({ useScope: 'global' });
	const { showMessage } = useSnackbarStore();

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
	});

	watch(query.error, e => {
		if (e) {
			showMessage(t('error_loading_records_or_categories'), 'red-darken-3');
		}
	});

	return { ...query, page, perPage, sortKey, sortOrder };
});

export function isRecordProperty(prop: string): prop is keyof Record {
	return recordQuery.split(', ').includes(prop);
}
