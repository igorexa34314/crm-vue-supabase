<template>
	<div>
		<div class="flex flex-row items-center">
			<h3 class="text-headline-medium text-title my-2 flex-grow-1 sm:text-headline-large">
				{{ $t('pageTitles.bill') }}
			</h3>
			<v-btn color="success" @click="refetchCurrencyThrottled">
				<v-icon :icon="mdiRefresh" />
			</v-btn>
		</div>
		<v-divider color="black" thickness="1.5" class="mb-5 mt-1 bg-white sm:mb-8" />

		<app-loader
			v-if="currencyState.status === 'pending'"
			:color="theme.global.current.value.dark ? '#FFFFFF' : '#1A237E'"
			class="mt-2"
			page />

		<template v-else-if="currencyState.status === 'success' && currencyState.data.rates">
			<v-row>
				<v-col cols="12" lg="4" md="6" sm="12">
					<MyBill v-if="userStore.info?.bill" :rates="currencyState.data.rates" />
				</v-col>
				<v-col cols="12" lg="8" md="6" sm="12">
					<CurrencyRates :rates="currencyState.data.rates" :date="currencyState.data.date" />
				</v-col>
			</v-row>
		</template>
	</div>
</template>

<script setup lang="ts">
import CurrencyRates from '@/components/home/CurrencyRates.vue';
import MyBill from '@/components/home/MyBill.vue';
import { useSeoMeta } from '@unhead/vue';
import { mdiRefresh } from '@mdi/js';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import { useCurrencyQuery } from '@/queries/currency';
import { useThrottleFn } from '@vueuse/core';

definePage({
	alias: ['home'],
});

const { t } = useI18n({ useScope: 'global' });
const theme = useTheme();
const userStore = useUserStore();

useSeoMeta({ title: () => t('pageTitles.bill') });

const { state: currencyState, refetch: refetchCurrency } = useCurrencyQuery();

const refetchCurrencyThrottled = useThrottleFn(refetchCurrency, 1500);
</script>
