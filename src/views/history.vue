<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">{{ t('pageTitles.history') }}</h3>
		</div>
		<v-divider color="black" thickness="1.5" class="bg-white mt-3 mb-6" />

		<div class="history-chart" v-if="!isLoading && pagedRecords">
			<Pie :options="chartOptions" :data="<ChartData<'pie'>>(chartData)" />
		</div>

		<app-loader v-if="isLoading" class="mt-7" page />

		<div v-else-if="!pagedRecords || !pagedRecords.length" class="text-center text-h6 mt-9">
			{{ t('no_records') + '. ' }}
			<router-link to="/record">{{ t('create_record') }}</router-link>
		</div>

		<section v-else class="mt-lg-6">
			<RecordsTable :records="pagedRecords" v-bind="{ sortProp, sortType, startIndex: (page - 1) * perPage }"
				@sort="sort" />

			<v-pagination v-if="pageCount > 1" v-model="page" @update:modelValue="pageChangeHandler" :length="pageCount"
				:total-visible="xs ? 3 : 4" class="mt-4" density="comfortable" :size="xs ? 'small' : 'default'"
				color="primary" />
		</section>
	</div>
</template>

<script setup lang="ts">
import RecordsTable from '@/components/history/RecordsTable.vue';
import { ref, computed } from 'vue';
import { useMeta } from 'vue-meta';
import { ChartData } from 'chart.js';
import { Pie } from 'vue-chartjs';
import { Category, CategoryService } from '@/services/category';
import { Record, RecordService } from '@/services/record';
import { usePagination } from '@/composables/usePagination';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { useChart } from '@/composables/useChart';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { useSort } from '@/composables/useSort';
import { useDisplay } from 'vuetify';

export type RecordWithCategory = Omit<Record, 'categoryId'> & { category: Category['title'] };

useMeta({ title: 'pageTitles.history' });

const { t } = useI18n({ inheritLocale: true, useScope: 'global' });
const { xs } = useDisplay();
const { cf } = useCurrencyFilter();
const records = ref<Record[]>();
const categories = ref<Category[]>();
const isLoading = ref(false);

try {
	isLoading.value = true;
	records.value = await RecordService.fetchRecords();
	categories.value = await CategoryService.fetchCategories();
} catch (e) {
	const { showMessage } = useSnackbarStore();
	showMessage('error_loading_records_or_categories');
}
finally {
	isLoading.value = false;
}

const recordsWithCategory = computed(() => records.value?.map<RecordWithCategory>(({ categoryId, ...r }) => ({
	...r,
	category: categories.value?.find(cat => cat.id === categoryId)?.title || '',
})));

// Sort records
const { sortedRecords, sortProp, sortType, sort } = useSort(recordsWithCategory, 'date');

// Init Records table pagination
const perPage = 5;
const { page, pageCount, pageChangeHandler, items: pagedRecords } = usePagination(sortedRecords, perPage);

const catsTitle = computed(() => categories.value?.map(c => c.title));
const catsAmount = computed(() => {
	return categories.value?.map(c => {
		const amount = records.value?.reduce((acc, r) => {
			if (r.categoryId === c.id && r.type === 'outcome') {
				acc += +r.amount;
			}
			return acc;
		}, 0);
		return cf.value(amount || 0);
	});
});

const { chartData, chartOptions } = useChart(catsTitle, catsAmount);
</script>

<style lang="scss" scoped>
.history-chart {
	margin: 0 auto;
	max-width: 550px;
}
</style>