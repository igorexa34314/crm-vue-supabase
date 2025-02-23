<template>
	<div>
		<div class="d-flex flex-row align-center">
			<h3 class="title text-h5 text-sm-h4 flex-grow-1 my-2 text-title">
				{{ $t('pageTitles.bill') }}
			</h3>
			<v-btn color="success" @click="refreshCurrency(1500)">
				<v-icon :icon="mdiRefresh" />
			</v-btn>
		</div>
		<v-divider color="black" thickness="1.5" class="bg-white mt-1 mb-5 mb-sm-8" />

		<app-loader
			v-if="isLoading"
			:color="theme.global.current.value.dark ? '#FFFFFF' : '#1A237E'"
			class="mt-2"
			page />

		<template v-else-if="currency?.rates && isReady">
			<v-row>
				<v-col cols="4" lg="4" md="6" sm="12" class="v-col-xs-12">
					<MyBill
						v-if="userStore.info?.bill && !isLoading && currency.rates"
						:rates="currency.rates" />
				</v-col>
				<v-col cols="8" lg="8" md="6" sm="12" class="v-col-xs-12">
					<CurrencyRates v-if="currency.rates" :rates="currency.rates" :date="currency.date" />
				</v-col>
			</v-row>
		</template>
	</div>
</template>

<script setup lang="ts">
import CurrencyRates from '@/components/home/CurrencyRates.vue';
import MyBill from '@/components/home/MyBill.vue';
import { inject } from 'vue';
import { useHead } from '@unhead/vue';
import { currencyKey } from '@/injection-keys';
import { mdiRefresh } from '@mdi/js';
import { useTheme } from 'vuetify';
import { useUserStore } from '@/stores/user';

definePage({
	alias: ['home'],
});

useHead({ title: 'pageTitles.bill' });

const theme = useTheme();
const userStore = useUserStore();

const { currency, isLoading, isReady, refresh: refreshCurrency } = inject(currencyKey)!;
</script>

<style lang="scss" scoped>
.v-theme--light .v-table {
	--v-border-opacity: 0.18;
}
</style>
