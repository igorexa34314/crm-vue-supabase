<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">{{ t('pageTitles.history') }}</h3>
		</div>
		<v-divider color="black" thickness="1.5" class="bg-white mt-3 mb-6" />

		<app-loader v-if="catLoading" class="mt-7" page />

		<div class="history-chart mx-auto" v-else-if="catStats && catStats.length">
			<Pie :options="chartOptions" :data="<ChartData<'pie'>>(chartData)" />
		</div>

		<section v-if="recordsState?.records && recordsState.records.length" class="mt-lg-6">
			<RecordsTable :records="recordsState.records" v-bind="{ sortField: sortState.field, sortType: sortState.type }"
				@sort="sortRecords" />

			<v-pagination v-if="pagesCount > 1" v-model="page" :length="pagesCount" :total-visible="xs ? 3 : 4" class="mt-4"
				density="comfortable" :size="xs ? 'small' : 'default'" color="primary" :disabled="recLoading" />
		</section>

		<div v-else-if="!catLoading && !recLoading && (!recordsState?.records || !recordsState?.records.length)"
			class="text-center text-h6 mt-9">
			{{ t('no_records') + '. ' }}
			<router-link to="/record">{{ t('create_record') }}</router-link>
		</div>
	</div>
</template>

<script setup lang="ts">
import RecordsTable from '@/components/history/RecordsTable.vue';
import { useMeta } from 'vue-meta';
import { ChartData } from 'chart.js';
import { Pie } from 'vue-chartjs';
import { CategoryService } from '@/services/category';
import { RecordService, SortType, SortFields } from '@/services/record';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { useChart } from '@/composables/useChart';
import { useDisplay } from 'vuetify';
import { ref, onUnmounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAsyncState } from '@vueuse/core';
import { DEFAULT_RECORDS_PER_PAGE } from '@/globals';

useMeta({ title: 'pageTitles.history' });

const { t } = useI18n({ inheritLocale: true, useScope: 'global' });
const { xs } = useDisplay();
const { push } = useRouter();
const route = useRoute();

// Draw chart from category spend stats
const { state: catStats, isLoading: catLoading } = useAsyncState(async () => {
	const categories = await CategoryService.fetchCategoriesSpendStats();
	return categories?.filter(cat => cat.spend > 0).map(({ title, spend }) => ({ label: title, data: spend }));
}, [], {
	onError: (e) => {
		const { showMessage } = useSnackbarStore();
		showMessage('error_loading_records_or_categories', 'red-darken-3');
	},
});

const { chartData, chartOptions } = useChart(catStats);

// Init Records table pagination and sorting
const perPage = DEFAULT_RECORDS_PER_PAGE;
const page = computed({
	get: () => +(route.query.page || 1),
	set: val => push({ query: { ...route.query, page: val.toString() } })
});
const pagesCount = computed(() => Math.ceil((recordsState.value?.count || perPage) / perPage));

const sortState = computed({
	get: () => ({
		field: ["id", "created_at", "amount", "category_id", "description", "type"].includes(route.query.sort as string) ? route.query.sort?.toString() as SortFields : 'created_at',
		type: ['asc', 'desc'].includes(route.query.by as string) ? (route.query.by as SortType) : 'desc'
	}),
	set: ({ field: sort, type: by }) => push({ query: { ...route.query, sort, by } })
});

const { state: recordsState, isLoading: recLoading } = useAsyncState(async () => {
	const result = await RecordService.fetchRecordsWithCategory({ sortBy: sortState.value.field, sortType: sortState.value.type, perPage, page: page.value });
	return { records: result?.records.map((r, idx) => ({ ...r, index: (page.value - 1) * perPage + ++idx })) || [], count: result?.count || 0 };
}, { records: [], count: 0 }, {
	onError: (e) => {
		const { showMessage } = useSnackbarStore();
		showMessage('error_loading_records_or_categories', 'red-darken-3');
	}
});

const sortRecords = async (field: SortFields) => {
	let sType: SortType = 'desc';
	if (field === sortState.value.field) {
		sType = sortState.value.type === 'asc' ? 'desc' : 'asc';
	}
	const records = await RecordService.loadMoreRecords({ sortBy: field, sortType: sType, page: page.value, perPage });
	if (records && records.length) {
		recordsState.value.records = records.map((r, idx) => ({ ...r, index: (page.value - 1) * perPage + ++idx }));
		sortState.value = { field, type: sType };
	}
}

watch(page, async (newPage) => {
	try {
		recLoading.value = true;

		const records = await RecordService.loadMoreRecords({ sortBy: sortState.value.field, sortType: sortState.value.type, page: newPage, perPage });
		if (records && records.length) {
			recordsState.value.records = records.map((r, idx) => ({ ...r, index: (page.value - 1) * perPage + ++idx }));
		}
	} catch (err) {
		const { showMessage } = useSnackbarStore();
		showMessage('error_loading_records', 'red-darken-3')
	}
	finally {
		recLoading.value = false;
	}
});

onUnmounted(() => push({ query: undefined }));
</script>

<style lang="scss" scoped>
.history-chart {
	max-width: 550px;
}
</style>

<route lang="yaml">
meta:
  withRouteQuery: true
</route>