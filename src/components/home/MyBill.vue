<template>
	<v-card color="card-2" class="p-4" elevation="1" min-height="300">
		<v-card-title class="text-headline-small text-title-large mb-5 sm:text-headline-small">{{
			$t('currency_account')
		}}</v-card-title>
		<v-card-text
			class="text-headline-small text-primary"
			:class="xs ? 'text-title-large' : 'text-headline-small'">
			<div v-for="cur in currencies" :key="cur" :class="xs ? 'mt-5' : 'mt-7'">
				<span class="mx-2">{{ $n(getCurrency(cur), { key: 'currency', currency: cur }) }}</span>
				<v-divider
					thickness="2.5"
					color="divider"
					:class="xs ? 'mt-2' : 'mt-4'"
					class="light:[--v-border-opacity:100]" />
			</div>
		</v-card-text>
	</v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { defaultBill } from '@/constants/app';
import { serverCurrency } from '@/constants/currency';
import { useDisplay } from 'vuetify';
import type { Currency, CurrencyRates } from '@/api/currency';

const { xs } = useDisplay();
const userStore = useUserStore();

const { rates } = defineProps<{
	rates: Currency['rates'];
}>();

const currencies = computed(() => Object.keys(rates || {}) as CurrencyRates[]);

const getCurrency = computed(() => (currency: CurrencyRates) => {
	const base = (userStore.info?.bill ?? defaultBill) / rates[serverCurrency];
	return +(base * rates[currency]).toFixed(2);
});
</script>
