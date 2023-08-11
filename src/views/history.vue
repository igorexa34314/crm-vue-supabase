<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">{{ t('pageTitles.history') }}</h3>
		</div>
		<v-divider color="black" thickness="1.5" class="bg-white mt-3 mb-6" />

		<app-loader v-if="catLoading" class="mt-7" page />

		<div class="history-chart mx-auto" v-else-if="catStats">
			<Pie :options="chartOptions" :data="<ChartData<'pie'>>(chartData)" />
		</div>

		<section v-if="recordsState?.records && recordsState.records.length" class="mt-lg-6">
			<RecordsTable :records="recordsState.records"
				v-bind="{ sortField: sortState.field, sortType: sortState.type, startIndex: (page - 1) * perPage }"
				@sort="sortRecords" />

			<v-pagination v-if="pagesCount > 1" v-model="page" :length="pagesCount" :total-visible="xs ? 3 : 4" class="mt-4"
				density="comfortable" :size="xs ? 'small' : 'default'" color="primary" />
		</section>

		<div v-else-if="!recLoading && (!recordsState?.records || !recordsState?.records.length)"
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
import { ref, watchEffect, onUnmounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAsyncState } from '@vueuse/core';
import { DEFAULT_PER_PAGE } from '@/globals';

useMeta({ title: 'pageTitles.history' });

const { t } = useI18n({ inheritLocale: true, useScope: 'global' });
const { xs } = useDisplay();
const { push } = useRouter();
const route = useRoute();

const { state: catStats, isLoading: catLoading } = useAsyncState(async () => {
	const categories = await CategoryService.fetchCategoriesSpendStats();
	return categories?.filter(cat => cat.spend > 0).map(({ title, spend }) => ({ label: title, data: spend }));
}, [], {
	onError: (e) => {
		const { showMessage } = useSnackbarStore();
		showMessage('error_loading_records_or_categories');
	},
});

const { chartData, chartOptions } = useChart(catStats);

// Init Records table pagination
const perPage = DEFAULT_PER_PAGE;
const page = ref(+(route.query.page || 1));
const pagesCount = computed(() => Math.ceil((recordsState.value?.count || perPage) / perPage));

const { state: recordsState, isLoading: recLoading } = useAsyncState(async () => {
	return RecordService.fetchRecordsWithCategory({ sortBy: 'created_at', sortType: 'desc', limit: perPage });
}, { records: [], count: 0 }, {
	onError: (e) => {
		const { showMessage } = useSnackbarStore();
		showMessage('error_loading_records_or_categories');
	}
});

const isRightPropInQuery = Object.keys(recordsState.value?.records.at(0) || {}).includes(route.query.sort as string);

const sortState = ref({
	field: isRightPropInQuery ? (route.query.sort as SortFields) : 'created_at',
	type: ['asc', 'desc'].includes(route.query.by as string) ? (route.query.by as SortType) : 'desc'
})

const sortRecords = async (field: SortFields) => {
	let sType: SortType = 'desc';
	if (field === sortState.value.field) {
		sType = sortState.value.type === 'asc' ? 'desc' : 'asc';
	}
	const records = await RecordService.loadMoreRecords({ sortBy: field, sortType: sType, page: page.value, perPage });
	if (records && records.length) {
		recordsState.value = { records, count: recordsState.value?.count || 0 };
		sortState.value = { field, type: sType };
	}
}

watchEffect(async () => {
	push({ query: { ...route.query, sort: sortState.value.field as string, by: sortState.value.type } });
});

watch(page, async (newPage) => {
	const records = await RecordService.loadMoreRecords({ sortBy: sortState.value.field, sortType: sortState.value.type, page: newPage, perPage });

	if (records && records.length) {
		recordsState.value = { records, count: recordsState.value?.count || 0 };
		push({ query: { ...route.query, page: newPage } });
	}
}, { immediate: true });

onUnmounted(() => push({ query: undefined }));
</script>

<style lang="scss" scoped>
.history-chart {
	max-width: 550px;
}
</style>