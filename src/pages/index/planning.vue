<template>
	<div>
		<div class="text-title mb-3 mt-2 flex flex-col sm:mt-4 sm:flex-row sm:items-center">
			<h3 class="text-headline-medium mb-3 ml-2 flex-grow-1 sm:text-headline-large sm:mb-0">
				{{ $t('pageTitles.plan') }}
			</h3>
			<v-skeleton-loader
				v-if="isCurrencyPending || !userStore.info?.bill"
				type="heading"
				width="100%"
				max-height="40px"
				color="background"
				max-width="260px" />
			<h4 v-else class="text-headline-medium text-end sm:text-headline-large">
				{{ $n(cf(bill), { key: 'currency', currency: userCurrency }) }}
			</h4>
		</div>
		<v-divider color="black" thickness="1.5" class="mb-8 bg-white" />

		<app-loader v-if="catSpendStatsState.status === 'pending'" class="mt-10" page />

		<div
			v-else-if="catSpendStatsState.status === 'success' && !catSpendStatsState.data.length"
			class="text-headline-small mt-10 text-center">
			{{ $t('no_categories') + '. '
			}}<router-link to="/categories">{{ $t('create_category') + '. ' }}</router-link>
		</div>

		<section v-else-if="catSpendStatsState.status === 'success'" class="mt-10 px-4">
			<div v-for="(cat, index) of catSpendStatsState.data" :key="cat.id || index" class="mt-8">
				<div class="flex flex-row items-center justify-between">
					<div class="mr-4">
						<strong class="text-primary font-bold grow min-w-0 truncate">{{
							cat.title + ':'
						}}</strong>
					</div>

					<div class="text-right flex-[0_0_160px] sm:flex-[0_0_260px]">
						<v-skeleton-loader
							v-if="isCurrencyPending"
							type="list-item"
							width="240px"
							max-height="24px"
							color="background" />
						<span v-else class="text-primary text-end sm:mr-4">
							{{
								$n(cf(cat.spend), {
									key: 'currency',
									currencyDisplay: xs ? 'narrowSymbol' : 'symbol',
									currency: userCurrency,
								}) +
								' ' +
								(xs ? '/' : $t('out_of')) +
								' ' +
								$n(cf(cat.limit), {
									key: 'currency',
									currencyDisplay: xs ? 'narrowSymbol' : 'symbol',
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
					:content-class="cat.limit - cat.spend < 0 ? 'bg-[#d84315]' : 'bg-[#7cb342]'">
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
								rounded-bar
								rounded
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
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useSeoMeta } from '@unhead/vue';
import { useUserStore } from '@/stores/user';
import { useCurrencyFilter } from '@/composables/currency-filter';
import { defaultBill } from '@/constants/app';
import { useCurrencyQueryState } from '@/queries/currency';
import { useCategoriesSpendStatsQuery } from '@/queries/category';
import { useDisplay } from 'vuetify';

const { t } = useI18n({ useScope: 'global' });
const { xs } = useDisplay();

useSeoMeta({ title: () => t('pageTitles.plan') });

const userStore = useUserStore();
const { userCurrency } = storeToRefs(userStore);
const { isPending: isCurrencyPending } = useCurrencyQueryState();
const cf = useCurrencyFilter();

const bill = computed(() => userStore.info?.bill || defaultBill);

const { state: catSpendStatsState } = useCategoriesSpendStatsQuery();
</script>
