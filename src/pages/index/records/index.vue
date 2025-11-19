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
			v-else-if="catSpendStatsState.status === 'success' && catSpendStatsState.data.length"
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
				:total-records="recordsState.data?.totalRecords"
				:records="recordsState.data?.records ?? []"
				:loading="recordsState.status === 'pending' || recordsAsyncStatus === 'loading'" />
		</section>

		<div
			v-if="
				catSpendStatsState.status !== 'pending' &&
				recordsState.status !== 'pending' &&
				!recordsState.data?.records.length
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
import { useChart } from '@/composables/chart';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useCategoriesSpendStatsQuery } from '@/queries/category';
import { useRecordsWithCategoryQuery, isRecordProperty } from '@/queries/record';
import type { DataTableSortItem } from 'vuetify';

const { t } = useI18n({ useScope: 'global' });

useSeoMeta({ title: () => t('pageTitles.history') });

const { state: catSpendStatsState, data: catSpendStats } = useCategoriesSpendStatsQuery();

const inputChartData = computed(() => {
	return catSpendStats.value
		?.filter(cat => cat.spend > 0)
		.map(c => ({ label: c.title, data: c.spend }));
});

// Draw chart from category spend stats
const { chartData, chartOptions } = useChart<'pie'>(inputChartData);

const sortBy = computed<DataTableSortItem[]>({
	get: () => [{ key: sortKey.value, order: sortOrder.value }] as DataTableSortItem[],
	set: value => {
		const key = value[0]?.key;
		sortKey.value = typeof key === 'undefined' || isRecordProperty(key) ? key : sortKey.value;
		sortOrder.value = !value[0]?.order || value[0].order === 'desc' ? 'desc' : 'asc';
	},
});

const {
	state: recordsState,
	asyncStatus: recordsAsyncStatus,
	page,
	perPage,
	sortKey,
	sortOrder,
} = useRecordsWithCategoryQuery();
</script>
