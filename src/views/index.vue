<template>
	<div>
		<div class="d-flex flex-row align-center">
			<h3 class="title text-h5 text-sm-h4 flex-grow-1 my-2 text-title">{{ t('pageTitles.bill') }}</h3>
			<v-btn color="success" @click="refresh(1500)">
				<v-icon :icon="mdiRefresh" />
			</v-btn>
		</div>
		<v-divider color="black" thickness="1.5" class="bg-white mt-1 mb-5 mb-sm-8" />

		<app-loader v-if="isLoading" :color="theme.global.current.value.dark ? '#FFFFFF' : '#1A237E'" class="mt-2" page />

		<v-row v-else-if="currency && isReady">
			<v-col cols="4" lg="4" md="6" sm="12" class="v-col-xs-12">
				<MyBill :rates="currency.rates" />
			</v-col>
			<v-col cols="8" lg="8" md="6" sm="12" class="v-col-xs-12">
				<CurrencyRates v-if="currency?.rates" :rates="currency.rates" :date="new Date(currency.date)" />
			</v-col>
		</v-row>
	</div>
</template>

<script setup lang="ts">
import MyBill from '@/components/home/MyBill.vue';
import CurrencyRates from '@/components/home/CurrencyRates.vue';
import { inject } from 'vue';
import { useMeta } from 'vue-meta';
import { useI18n } from 'vue-i18n';
import { currencyKey } from '@/injection-keys';
import { mdiRefresh } from '@mdi/js';
import { useTheme } from 'vuetify';
import { definePage } from 'vue-router/auto';

useMeta({ title: 'pageTitles.bill' });

definePage({
	alias: ['/home'],
});

const { t } = useI18n({ useScope: 'global' });
const theme = useTheme();

const { currency, isLoading, isReady, refresh } = inject(currencyKey)!;
</script>

<style scoped>
.v-theme--light .v-table {
	--v-border-opacity: 0.18;
}
</style>
