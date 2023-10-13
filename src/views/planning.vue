<template>
	<div>
		<div class="title mt-2 mt-sm-4 d-flex flex-column flex-sm-row align-sm-center mb-3 text-title">
			<h3 class="text-h5 text-sm-h4 ml-2 flex-grow-1 mb-3 mb-sm-0">{{ t('pageTitles.plan') }}</h3>
			<h4 class="text-h5 text-sm-h4 text-end">{{ n(cf(bill), { key: 'currency', currency: userCurrency }) }}</h4>
		</div>
		<v-divider color="black" thickness="1.5" class="bg-white mb-8" />
		<app-loader v-if="isLoading" class="mt-10" page />
		<div v-else-if="!catStats.length" class="mt-10 text-center text-h6">
			{{ t('no_categories') + '. ' }}<router-link to="/categories">{{ t('create_category') + '. ' }}</router-link>
		</div>

		<section v-else class="mt-10 px-4">
			<div v-for="(cat, index) of catStats" :key="cat.id || index" class="mt-8">
				<p class="d-flex flex-row align-center justify-space-between mb-3">
					<strong class="category-title text-truncate font-weight-bold mr-4 text-primary flex-fill"
						>{{ cat.title }}:</strong
					>
					<span class="category-spent mr-sm-4 text-primary text-end">
						{{
							n(cf(cat.spend), {
								key: 'currency',
								currencyDisplay: xs ? 'narrowSymbol' : 'symbol',
								currency: userCurrency,
							}) +
							' ' +
							(xs ? '/' : t('out_of')) +
							' ' +
							n(cf(cat.limit), {
								key: 'currency',
								currencyDisplay: xs ? 'narrowSymbol' : 'symbol',
								currency: userCurrency,
							})
						}}
					</span>
				</p>
				<v-progress-linear
					:model-value="cat.percent"
					:id="`progress-${cat.id}`"
					:color="cat.percent >= 90 ? 'red' : cat.percent >= 60 ? 'yellow' : 'green'"
					style="cursor: pointer"
					rounded
					rounded-bar
					bg-color="progress" />
				<v-tooltip
					:activator="`#progress-${cat.id}`"
					location="bottom"
					:content-class="cat.limit - cat.spend < 0 ? 'bg-deep-orange-darken-3' : 'bg-light-green-darken-1'">
					{{
						(cat.limit - cat.spend < 0 ? t('exceeding') : t('left')) +
						' ' +
						n(Math.abs(cf(cat.limit) - cf(cat.spend)), { key: 'currency', currency: userCurrency })
					}}
				</v-tooltip>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { CategoryService } from '@/services/category';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMeta } from 'vue-meta';
import { useAsyncState } from '@vueuse/core';
import { useUserStore } from '@/stores/user';
import { useSnackbarStore } from '@/stores/snackbar';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { useDisplay } from 'vuetify';
import { VProgressLinear, VTooltip } from 'vuetify/components';
import { DEFAULT_BILL } from '@/global-vars';

useMeta({ title: 'pageTitles.plan' });

const { t, n, te } = useI18n({ useScope: 'global' });
const { xs } = useDisplay();
const userStore = useUserStore();

const { userCurrency } = storeToRefs(userStore);
const { cf } = useCurrencyFilter();

const bill = computed(() => userStore.info?.bill || DEFAULT_BILL);

const { state: catStats, isLoading } = useAsyncState(CategoryService.fetchCategoriesSpendStats, [], {
	onError: e => {
		const { showMessage } = useSnackbarStore();
		showMessage(te(`warnings.${e}`) ? t(`warnings.${e}`) : (e as string), 'red-darken-3');
	},
});
</script>

<style lang="scss" scoped>
.category {
	&-spent {
		@media (max-width: 360px) {
			flex-basis: 130px;
		}
	}
}
</style>
