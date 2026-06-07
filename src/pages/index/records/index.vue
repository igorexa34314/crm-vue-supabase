<template>
	<div>
		<div>
			<h3 class="text-headline-medium text-title ml-2 mt-2 sm:text-headline-large sm:mt-4">
				{{ $t('pageTitles.history') }}
			</h3>
		</div>
		<v-divider color="black" thickness="1.5" class="mb-6 mt-3 bg-white" />

		<app-loader v-if="catSpendStatsState.status === 'pending'" class="mt-7" page />

		<div
			v-else-if="catSpendStatsState.status === 'success' && catSpendStatsState.data.length"
			:style="{ 'max-width': xs ? '380px' : '550px' }"
			class="history-chart mx-auto">
			<Pie id="category-stats-chart" :options="chartOptions" :data="chartData">
				Canvas element is not supported in your browser
			</Pie>
		</div>

		<section class="lg:mt-6" v-if="catSpendStatsState.status !== 'pending'">
			<RecordsTable
				v-model:page="page"
				v-model:per-page="perPage"
				v-model:sort-by="sortBy"
				:user-currency="userCurrency"
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
			class="text-headline-small mt-9 text-center">
			{{ $t('no_records') + '. ' }}
			<router-link to="/records/create">{{ $t('create_record') }}</router-link>
		</div>
	</div>
</template>

<script setup lang="ts">
import RecordsTable from '@/components/record/RecordsTable.vue';
import { useSeoMeta } from '@unhead/vue';
import { Pie } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';
import { useCategoriesSpendStatsQuery } from '@/queries/category';
import { useRecordsWithCategoryQuery, isRecordProperty } from '@/queries/record';
import { useUserInfoQuery } from '@/queries/user';
import { computed } from 'vue';
import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	ArcElement,
	PieController,
	type ChartData,
	type ChartOptions,
} from 'chart.js';
import { useTheme, useDisplay, type DataTableSortItem } from 'vuetify';
import { useCurrencyFilter } from '@/composables/currency-filter';
import randomColor from 'randomcolor';

ChartJS.register(Title, Tooltip, Legend, PieController, ArcElement);

const { t, n } = useI18n();
const { xs } = useDisplay();
const theme = useTheme();
const cf = useCurrencyFilter();

useSeoMeta({ title: () => t('pageTitles.history') });

const { userCurrency } = useUserInfoQuery();
const { state: catSpendStatsState, data: catSpendStats } = useCategoriesSpendStatsQuery();

const inputChartData = computed(() => {
	return catSpendStats.value
		?.filter(cat => cat.spend > 0)
		.map(c => ({ label: c.title, data: c.spend }));
});

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

const chartOptions = computed(
	() =>
		({
			responsive: true,
			plugins: {
				title: {
					display: true,
					text: t('chart_title'),
					color: theme.global.current.value.dark ? '#B8C7D3' : '#D50000',
					font: {
						size: xs.value ? 18 : 22,
						lineHeight: '1.5',
					},
				},
				legend: {
					display: !xs.value,
					position: 'left',
					align: 'center',
					labels: {
						boxHeight: 30,
						font: {
							weight: 'bold',
							size: 16,
						},
					},
				},
				tooltip: {
					enabled: true,
					callbacks: {
						label: item => {
							const value = item.dataset.data[item.dataIndex];
							if (value) {
								return n(cf(value), {
									key: 'currency',
									currency: userCurrency.value,
								});
							}
						},
					},
				},
			},
		}) as ChartOptions<'pie'>
);

const chartData = computed(
	() =>
		({
			labels: inputChartData.value?.map(d => d.label) || [],
			datasets: [
				{
					data: inputChartData.value?.map(d => d.data),
					backgroundColor: randomColor({
						count: inputChartData.value?.length || 1,
						hue: theme.global.current.value.dark ? '#0E5578' : 'random',
						luminosity: theme.global.current.value.dark ? 'light' : 'bright',
					}),
					borderColor: theme.global.current.value.dark ? '#143c53' : '#8D6E63',
				},
			],
		}) as unknown as ChartData<'pie'>
);
</script>
