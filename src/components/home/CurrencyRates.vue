<template>
	<v-card color="card-1" elevation="3" :min-height="$vuetify.display.smAndDown ? 'auto' : '300'">
		<v-card-item>
			<v-card-title class="mx-3 mt-3 text-h6 text-sm-h5">{{ $t('exchange_rate') }}</v-card-title>
		</v-card-item>
		<v-card-text>
			<v-table class="bg-transparent" :density="$vuetify.display.xs ? 'comfortable' : 'default'">
				<thead>
					<tr>
						<th class="text-title text-subtitle-1 font-weight-bold">{{ $t('currency') }}</th>
						<th class="text-title text-subtitle-1 font-weight-bold">{{ $t('rate') }}</th>
						<th class="text-title text-subtitle-1 font-weight-bold">{{ $t('date') }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="cur in currencies" :key="cur" class="text-primary text-subtitle-1">
						<td>{{ cur }}</td>
						<td>{{ `${(1 / rates[cur]).toFixed(3)} ${userCurrency}` }}</td>
						<td>{{ $d(date, $vuetify.display.xs ? 'shortdate' : 'short') }}</td>
					</tr>
				</tbody>
			</v-table>
		</v-card-text>
	</v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import type { Currency, CurrencyRates } from '@/api/currency';

const { rates, date = new Date() } = defineProps<{
	rates: Currency['rates'];
	date?: Currency['date'];
}>();

const { userCurrency } = storeToRefs(useUserStore());

const currencies = computed(
	() => Object.keys(rates || {}).filter(cur => cur !== userCurrency.value) as CurrencyRates[]
);
</script>
