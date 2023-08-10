<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">{{ t('pageTitles.history') }}</h3>
		</div>
		<v-divider color="black" thickness="1.5" class="bg-white mt-3 mb-6" />

		<div class="history-chart" v-if="!catLoading && pagedRecords">
			<Pie :options="chartOptions" :data="<ChartData<'pie'>>(chartData)" />
		</div>

		<app-loader v-if="catLoading" class="mt-7" page />

		<div v-else-if="!pagedRecords || !pagedRecords.length" class="text-center text-h6 mt-9">
			{{ t('no_records') + '. ' }}
			<router-link to="/record">{{ t('create_record') }}</router-link>
		</div>

		<section v-else class="mt-lg-6">
			<RecordsTable :records="pagedRecords"
				v-bind="{ sortField: sortState.field, sortType: sortState.type, startIndex: (page - 1) * perPage }"
				@sort="sortRecords" />

			<v-pagination v-if="pageCount > 1" v-model="page" @update:modelValue="pageChangeHandler" :length="pageCount"
				:total-visible="xs ? 3 : 4" class="mt-4" density="comfortable" :size="xs ? 'small' : 'default'"
				color="primary" />
		</section>
	</div>
</template>

<script setup lang="ts">
import RecordsTable from '@/components/history/RecordsTable.vue';
import { useMeta } from 'vue-meta';
import { ChartData } from 'chart.js';
import { Pie } from 'vue-chartjs';
import { CategoryService } from '@/services/category';
import { RecordService, SortType, SortFields } from '@/services/record';
import { usePagination } from '@/composables/usePagination';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { useChart } from '@/composables/useChart';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { useDisplay } from 'vuetify';
import { Ref, ref, unref, watchEffect, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAsyncState } from '@vueuse/core';

useMeta({ title: 'pageTitles.history' });

const { t } = useI18n({ inheritLocale: true, useScope: 'global' });
const { xs } = useDisplay();
const { cf } = useCurrencyFilter();

const { state: records, isLoading: recLoading, execute: loadRecords } = useAsyncState(async (...args: Parameters<typeof RecordService.fetchRecordsWithCategory>) => {
	return RecordService.fetchRecordsWithCategory(...args);
}, [], {
	onError: (e) => {
		const { showMessage } = useSnackbarStore();
		showMessage('error_loading_records_or_categories');
	}
});

const { state: catStats, isLoading: catLoading } = useAsyncState(async () => {
	const categories = await CategoryService.fetchCategoriesSpendStats();
	return categories?.filter(cat => cat.spend > 0).map(({ title, spend }) => ({ label: title, data: spend }));
}, [], {
	onError: (e) => {
		const { showMessage } = useSnackbarStore();
		showMessage('error_loading_records_or_categories');
	},
});

const { push } = useRouter();
const route = useRoute();

const isRightPropInQuery = Object.keys(records.value?.at(0) || {}).includes(route.query.sort as string);

const sortState = ref({
	field: isRightPropInQuery ? (route.query.sort as SortFields) : 'created_at',
	type: ['asc', 'desc'].includes(route.query.by as string) ? (route.query.by as SortType) : 'desc'
})

const sortRecords = async (field: SortFields) => {
	let sType: SortType = 'desc';
	if (field === sortState.value.field) {
		sType = sortState.value.type === 'asc' ? 'desc' : 'asc';
	}
	await loadRecords(1000, field, sType);
	sortState.value = { field, type: sType };
}

watchEffect(async () => {
	push({ query: { ...route.query, sort: sortState.value.field as string, by: sortState.value.type } });
});

onUnmounted(() => push({ query: undefined }));

// Init Records table pagination
const perPage = 5;
const { page, pageCount, pageChangeHandler, items: pagedRecords } = usePagination(records, perPage);
const { chartData, chartOptions } = useChart(catStats);
</script>

<style lang="scss" scoped>
.history-chart {
	margin: 0 auto;
	max-width: 550px;
}
</style>