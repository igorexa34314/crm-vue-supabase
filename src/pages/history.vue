<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">{{ t('pageTitles.history') }}</h3>
		</div>
		<v-divider color="black" thickness="1.5" class="bg-white mt-3 mb-6" />

		<app-loader v-if="categoriesLoading" class="mt-7" page />

		<div
			v-else-if="catStats && catStats.length"
			:style="{ 'max-width': xs ? '380px' : '550px' }"
			class="history-chart mx-auto">
			<Pie id="category-stats-chart" :options="chartOptions" :data="chartData">
				Canvas element is not supported in your browser
			</Pie>
		</div>

		<section class="mt-lg-6" v-if="!categoriesLoading">
			<RecordsTable
				:per-page="perPage"
				:total-records="totalRecords || records.length"
				:records="records"
				:loading="recordsLoading"
				@sort="sortRecords" />
		</section>

		<div
			v-if="!categoriesLoading && !recordsLoading && (!records || !records.length)"
			class="text-center text-h6 mt-9">
			{{ t('no_records') + '. ' }}
			<router-link to="/record">{{ t('create_record') }}</router-link>
		</div>
	</div>
</template>

<script setup lang="ts">
import RecordsTable, { type SortEmitData } from '@/components/history/RecordsTable.vue';
import { useHead } from '@unhead/vue';
import { Pie } from 'vue-chartjs';
import { fetchCategoriesSpendStats } from '@/api/category';
import { fetchRecordsWithCategory, type SortFields, type RecordWithCategory } from '@/api/record';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { useChart } from '@/composables/useChart';
import { ref, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router/auto';
import { useAsyncState } from '@vueuse/core';
import { DEFAULT_RECORDS_PER_PAGE } from '@/global-vars';
import { useDisplay } from 'vuetify';

useHead({ title: 'pageTitles.history' });

const { t } = useI18n({ useScope: 'global' });
const { xs } = useDisplay();
const { replace } = useRouter();
const route = useRoute('/history');

const { state: catStats, isLoading: categoriesLoading } = useAsyncState(
	async () => {
		const categories = await fetchCategoriesSpendStats();
		return categories.filter(cat => cat.spend > 0).map(c => ({ label: c.title, data: c.spend }));
	},
	[],
	{
		onError: () => {
			const { showMessage } = useSnackbarStore();
			showMessage('error_loading_records_or_categories', 'red-darken-3');
		},
	}
);
// Draw chart from category spend stats
const { chartData, chartOptions } = useChart<'pie'>(catStats);

// Init Records table pagination and sorting
const perPage = ref(DEFAULT_RECORDS_PER_PAGE);

const totalRecords = ref(0);
const recordsLoading = ref(false);
const records = ref<(RecordWithCategory & { index: number })[]>([]);

const sortRecords = async ({ page, itemsPerPage, sortBy }: SortEmitData) => {
	try {
		recordsLoading.value = true;
		const sortArg: Parameters<typeof fetchRecordsWithCategory>[number] = {
			page: +page,
			perPage: +itemsPerPage,
		};
		if (sortBy && Object.keys(sortBy).length) {
			sortArg.order = sortBy[0].order === true ? 'asc' : sortBy[0].order || 'desc';
			sortArg.sortBy = sortBy[0].key as SortFields;
		}
		const { records: recordsData, count } = await fetchRecordsWithCategory(sortArg);
		totalRecords.value = count;
		records.value = recordsData.map((r, idx) => ({ ...r, index: (+page - 1) * +itemsPerPage + ++idx }));
		replace({ query: { ...route.query, ...sortArg } });
	} catch (err) {
		console.log(err);
		const { showMessage } = useSnackbarStore();
		showMessage('error_loading_records_or_categories', 'red-darken-3');
	} finally {
		recordsLoading.value = false;
	}
};
onUnmounted(() => replace({ query: undefined }));
</script>
