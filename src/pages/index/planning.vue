<template>
	<div>
		<div
			class="title mt-2 mt-sm-4 d-flex flex-column flex-sm-row align-sm-center mb-3 text-title">
			<h3 class="text-h5 text-sm-h4 ml-2 flex-grow-1 mb-3 mb-sm-0">
				{{ $t('pageTitles.plan') }}
			</h3>
			<v-skeleton-loader
				v-if="isCurrencyPending || !userStore.info?.bill"
				type="heading"
				width="100%"
				max-height="40px"
				color="background"
				max-width="260px" />
			<h4 v-else class="text-h5 text-sm-h4 text-end">
				{{ $n(cf(bill), { key: 'currency', currency: userCurrency }) }}
			</h4>
		</div>
		<v-divider color="black" thickness="1.5" class="bg-white mb-8" />

		<app-loader v-if="catSpendStatsState.status === 'pending'" class="mt-10" page />

		<div
			v-else-if="catSpendStatsState.status === 'success' && !catSpendStatsState.data.length"
			class="mt-10 text-center text-h6">
			{{ $t('no_categories') + '. '
			}}<router-link to="/categories">{{ $t('create_category') + '. ' }}</router-link>
		</div>

		<section v-else-if="catSpendStatsState.status === 'success'" class="mt-10 px-4">
			<div v-for="(cat, index) of catSpendStatsState.data" :key="cat.id || index" class="mt-8">
				<div class="d-flex flex-row align-center justify-space-between">
					<div class="category-title mr-4">
						<strong class="text-truncate font-weight-bold text-primary flex-fill">{{
							cat.title + ':'
						}}</strong>
					</div>

					<div class="category-spent">
						<v-skeleton-loader
							v-if="isCurrencyPending"
							type="list-item"
							width="240px"
							max-height="24px"
							color="background" />
						<span v-else class="text-primary text-end mr-sm-4">
							{{
								$n(cf(cat.spend), {
									key: 'currency',
									currencyDisplay: $vuetify.display.xs ? 'narrowSymbol' : 'symbol',
									currency: userCurrency,
								}) +
								' ' +
								($vuetify.display.xs ? '/' : $t('out_of')) +
								' ' +
								$n(cf(cat.limit), {
									key: 'currency',
									currencyDisplay: $vuetify.display.xs ? 'narrowSymbol' : 'symbol',
									currency: userCurrency,
								})
							}}
						</span>
					</div>
				</div>

				<v-tooltip
					location="bottom"
					:offset="[0, -30]"
					target="cursor"
					:content-class="
						cat.limit - cat.spend < 0 ? 'bg-deep-orange-darken-3' : 'bg-light-green-darken-1'
					">
					{{
						(cat.limit - cat.spend < 0 ? $t('exceeding') : $t('left')) +
						' ' +
						$n(Math.abs(cf(cat.limit) - cf(cat.spend)), {
							key: 'currency',
							currency: userCurrency,
						})
					}}
					<template #activator="{ props }">
						<div v-bind="props" class="py-2">
							<v-progress-linear
								:model-value="cat.percent"
								:id="`progress-${cat.id}`"
								:color="cat.percent >= 90 ? 'red' : cat.percent >= 60 ? 'yellow' : 'green'"
								class="cursor-pointer"
								rounded
								rounded-bar
								bg-color="progress" />
						</div>
					</template>
				</v-tooltip>
			</div>
		</section>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useSeoMeta } from '@unhead/vue';
import { useUserStore } from '@/stores/user';
import { useCurrencyFilter } from '@/composables/currency-filter';
import { defaultBill } from '@/constants/app';
import { useCurrencyQueryState } from '@/queries/currency';
import { useCategoriesSpendStatsQuery } from '@/queries/categories';

useSeoMeta({ title: 'pageTitles.plan' });

const userStore = useUserStore();

const { userCurrency } = storeToRefs(userStore);
const { isPending: isCurrencyPending } = useCurrencyQueryState();
const cf = useCurrencyFilter();

const bill = computed(() => userStore.info?.bill || defaultBill);

const { state: catSpendStatsState } = useCategoriesSpendStatsQuery();
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
