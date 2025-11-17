<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">
				{{ $t('pageTitles.history') }}
			</h3>
		</div>
		<v-divider color="black" thickness="1.5" class="bg-white mt-3 mb-6" />

		<app-loader v-if="catSpendStatsState.status === 'pending'" class="mt-7" page />

		<div
			v-else-if="catSpendStatsState.status === 'success' && catSpendStatsState.data?.length"
			:style="{ 'max-width': $vuetify.display.xs ? '380px' : '550px' }"
			class="history-chart mx-auto">
			<Pie id="category-stats-chart" :options="chartOptions" :data="chartData">
				Canvas element is not supported in your browser
			</Pie>
		</div>

		<section class="mt-lg-6" v-if="catSpendStatsState.status !== 'pending'">
			<RecordsTable
				v-model:page="page"
				v-model:per-page="perPage"
				v-model:sort-by="sortBy"
				:total-records="recordsData.totalRecords"
				:records="recordsData.records"
				:loading="recordsLoading"
				@update:options="loadRecords" />
		</section>

		<div
			v-if="
				catSpendStatsState.status !== 'pending' &&
				!recordsLoading &&
				!recordsData.records.length
			"
			class="text-center text-h6 mt-9">
			{{ $t('no_records') + '. ' }}
			<router-link to="/records/create">{{ $t('create_record') }}</router-link>
		</div>
	</div>
</template>

<script setup lang="ts">
import RecordsTable from '@/components/record/RecordsTable.vue';
import { useSeoMeta } from '@unhead/vue';
import { Pie } from 'vue-chartjs';
import { fetchRecordsWithCategory, type Record } from '@/api/record';
import { useSnackbarStore } from '@/stores/snackbar';
import { useChart } from '@/composables/chart';
import { computed } from 'vue';
import { useAsyncState } from '@vueuse/core';
import { defaultRecordsPerPage } from '@/constants/app';
import { useRouteQuery } from '@vueuse/router';
import type { DataTableSortItem } from 'vuetify';
import { useCategoriesSpendStatsQuery } from '@/queries/categories';

useSeoMeta({ title: 'pageTitles.history' });

const { showMessage } = useSnackbarStore();

const { state: catSpendStatsState, data: catSpendStats } = useCategoriesSpendStatsQuery();

const inputChartData = computed(() => {
	return catSpendStats.value
		?.filter(cat => cat.spend > 0)
		.map(c => ({ label: c.title, data: c.spend }));
});

// Draw chart from category spend stats
const { chartData, chartOptions } = useChart<'pie'>(inputChartData);

// Init Records table pagination and sorting
const page = useRouteQuery('page', '1', { transform: Number });
const perPage = useRouteQuery('perPage', `${defaultRecordsPerPage}`, { transform: Number });
const sortKey = useRouteQuery<string>('sort', '');
const sortOrder = useRouteQuery('order', undefined, {
	transform: v => (!v || v === 'desc' ? 'desc' : 'asc'),
});

const sortBy = computed<DataTableSortItem[]>({
	get: () => [{ key: sortKey.value, order: sortOrder.value }] as DataTableSortItem[],
	set: value => {
		sortKey.value = value[0]?.key ?? sortKey.value;
		sortOrder.value = !value[0]?.order || value[0].order === 'desc' ? 'desc' : 'asc';
	},
});

const {
	state: recordsData,
	isLoading: recordsLoading,
	execute: loadRecords,
} = useAsyncState(
	async () => {
		const { records, count } = await fetchRecordsWithCategory({
			page: page.value,
			perPage: perPage.value,
			order: sortOrder.value,
			sortBy: sortKey.value as keyof Record,
		});
		return { records, totalRecords: count || records.length };
	},
	{ records: [], totalRecords: 0 },
	{
		resetOnExecute: false,
		immediate: false,
		onError: err => {
			console.log(err);
			showMessage('error_loading_records_or_categories', 'red-darken-3');
		},
	}
);
</script>
