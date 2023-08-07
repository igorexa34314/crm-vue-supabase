<template>
	<div>
		<div class="title mt-2 mt-sm-4 d-flex flex-column flex-sm-row align-sm-center mb-3 text-title">
			<h3 class="text-h5 text-sm-h4 ml-2 flex-grow-1 mb-3 mb-sm-0">{{ t('pageTitles.plan') }}</h3>
			<h4 class="text-h5 text-sm-h4 text-end">{{ n(cf(bill!), 'currency', userCurrency) }}</h4>
		</div>
		<v-divider color="black" thickness="1.5" class="bg-white mb-8" />
		<app-loader v-if="isLoading" class="mt-10" page />
		<div v-else-if="catStats && !catStats.length" class="mt-10 text-center text-h6">{{
			t('pageTitles.plan')
		}}<router-link to="/categories">{{ t('no_categories') + '. ' }}</router-link></div>

		<section v-else class="mt-10 px-4">
			<div v-for="(cat, index) of catStats" :key="cat.id || index" class="mt-8">
				<p class="d-flex flex-row align-center justify-space-between mb-3">
					<strong class="category-title font-weight-bold mr-4 text-primary flex-fill">{{ cat.title }}:</strong>
					<span class="category-spent mr-sm-4 text-primary text-end">
						{{
							n(cf(cat.spend), { key: 'currency', currencyDisplay: xs ? 'narrowSymbol' : 'symbol' }, userCurrency) +
							' ' + (xs ? '/' : t('out_of')) + ' ' +
							n(cf(cat.limit), { key: 'currency', currencyDisplay: xs ? 'narrowSymbol' : 'symbol' }, userCurrency)
						}}
					</span>
				</p>
				<v-progress-linear :model-value="cat.percent" :id="`progress-${cat.id}`"
					:color="cat.percent >= 90 ? 'red' : cat.percent >= 60 ? 'yellow' : 'green'" style="cursor: pointer;" rounded
					rounded-bar bg-color="progress" />
				<v-tooltip :activator="`#progress-${cat.id}`" location="bottom"
					:content-class="(cat.limit - cat.spend) < 0 ? 'bg-deep-orange-darken-3' : 'bg-light-green-darken-1'">
					{{ ((cat.limit - cat.spend) < 0 ? t('exceeding') : t('left')) + ' ' + n(Math.abs(cf(cat.limit) -
						cf(cat.spend)), 'currency', userCurrency) }} </v-tooltip>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { CategoryService, Category } from '@/services/category';
import { RecordService } from '@/services/record';
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMeta } from 'vue-meta';
import { useInfoStore } from '@/stores/info';
import { useSnackbarStore } from '@/stores/snackbar';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { useDisplay } from 'vuetify';

useMeta({ title: 'pageTitles.plan' });

const { t, n, te } = useI18n({ inheritLocale: true, useScope: 'global' });
const { xs } = useDisplay();
const infoStore = useInfoStore();

const { userCurrency } = storeToRefs(infoStore);
const { cf } = useCurrencyFilter();

const bill = computed(() => infoStore.info?.bill || 1000);
const isLoading = ref(false);

interface CategoryStats extends Category {
	percent: number;
	spend: number;
}
const catStats = ref<CategoryStats[]>();
try {
	isLoading.value = true;
	const records = await RecordService.fetchRecords();
	const cats = await CategoryService.fetchCategories();
	if (cats && records) {
		catStats.value = cats.map(cat => {
			const spend = records.filter(r => r.categoryId === cat.id)
				.filter(r => r.type === 'outcome')
				.reduce((sum, r) => sum += +r.amount, 0);
			const percent = ((100 * spend / cat.limit) > 100) ? 100 : (100 * spend / cat.limit);
			return {
				...cat,
				percent,
				spend,
			}
		});
	}
} catch (e) {
	const { showMessage } = useSnackbarStore();
	showMessage(te(`firebase.messages.${e}`) ? t(`firebase.messages.${e}`) : e as string);
} finally {
	isLoading.value = false;
}
</script>

<style lang="scss" scoped>
.category {
	&-title {
		overflow: hidden;
		text-overflow: ellipsis;
		@media(max-width: 320px) {}
	}
	&-spent {
		@media(max-width: 360px) {
			flex-basis: 130px;
		}
	}
}
</style>
