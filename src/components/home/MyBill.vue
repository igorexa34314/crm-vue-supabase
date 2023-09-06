<template>
	<v-card color="card-2" class="pa-4" elevation="3" min-height="300">
		<v-card-title class="text-h5 mb-5 text-h6 text-sm-h5">{{ t('currency_account') }}</v-card-title>
		<v-card-text class="text-h5 text-primary" :class="xs ? 'text-h6' : 'text-h5'">
			<div v-for="cur in currencies" :key="cur" :class="xs ? 'mt-5' : 'mt-7'">
				<span class="mx-2">{{ n(getCurrency(cur), { key: 'currency', currency: cur }) }}</span>
				<v-divider color="primary" thickness="2.5" class="bg-white" :class="xs ? 'mt-2' : 'mt-4'" />
			</div>
		</v-card-text>
	</v-card>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { Currency, CurrencyRates } from '@/services/currency';
import { useDisplay } from 'vuetify';
import { DEFAULT_CURRENCY } from '@/globals';

const { t, n } = useI18n();
const { xs } = useDisplay();
const infoStore = useUserStore();

const props = defineProps<{
	rates: Currency['rates'];
}>();

const currencies = computed(() => Object.keys(props.rates || {}) as CurrencyRates[]);

const info = computed(() => infoStore.info);

const getCurrency = computed(() => (currency: CurrencyRates) => {
	const base = info.value ? info.value.bill / props.rates[DEFAULT_CURRENCY] : 0;
	return Math.floor(base * props.rates[currency]);
});
</script>

<style scoped>
.v-theme--light .v-divider {
	--v-border-opacity: 1;
}
</style>
@/utils/numberFormats
