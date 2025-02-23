<template>
	<v-card color="card-2" class="pa-4" elevation="3" min-height="300">
		<v-card-title class="text-h5 mb-5 text-h6 text-sm-h5">{{
			$t('currency_account')
		}}</v-card-title>
		<v-card-text
			class="text-h5 text-primary"
			:class="$vuetify.display.xs ? 'text-h6' : 'text-h5'">
			<div v-for="cur in currencies" :key="cur" :class="$vuetify.display.xs ? 'mt-5' : 'mt-7'">
				<span class="mx-2">{{ $n(getCurrency(cur), { key: 'currency', currency: cur }) }}</span>
				<v-divider
					thickness="2.5"
					color="divider"
					:class="$vuetify.display.xs ? 'mt-2' : 'mt-4'" />
			</div>
		</v-card-text>
	</v-card>
</template>

<script setup lang="ts">
import { VDivider } from 'vuetify/lib/components/index.mjs';
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';
import type { Currency, CurrencyRates } from '@/api/currency';
import { defaultBill } from '@/constants/app';
import { serverCurrency } from '@/constants/currency';

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

<style lang="scss" scoped>
.v-theme--light .v-divider {
	--v-border-opacity: 1;
}
</style>
