<template>
	<v-table class="records-table" :density="xs ? 'comfortable' : 'default'">
		<thead class="text-title">
			<tr>
				<th>#</th>
				<th v-for="h in tableHeaders" :key="h">
					<span @click="triggerSort(h as keyof RecordWithCategory)">{{ t(h) }}</span>
					<v-icon v-if="sortProp === h" :icon="sortType === 'asc' ? mdiMenuUp : mdiMenuDown" size="small" class="ml-1"
						@click="triggerSort(h as keyof RecordWithCategory)" />
				</th>
			</tr>
		</thead>
		<tbody class="text-primary">
			<template v-for="(rec, index) in records" :key="rec.id">
				<v-hover v-slot="{ isHovering, props }">
					<tr @click="push('/detail/' + rec.id)" class="record" v-bind="props" :class="isHovering ? 'bg-hover' : ''">
						<td>{{ startIndex + (index + 1) }}</td>
						<td>{{ n(cf(rec.amount), 'currency', userCurrency) }}</td>
						<td>{{ d(rec.date, smAndDown ? 'shortdate' : 'short') }}</td>
						<td class="record-category">{{ rec.category }}</td>
						<td>
							<span :class="rec.type === 'outcome' ? 'bg-red-darken-4' : 'bg-green-darken-2'"
								class="py-2 px-3 text-center text-trend">
								<v-icon :icon="rec.type === 'outcome' ? mdiTrendingDown : mdiTrendingUp"
									:class="{ 'mr-2': !smAndDown }" :size="xs ? 'small' : 'default'" />
								{{ smAndDown ? '' :
									rec.type === 'income' ? t('income').toLowerCase() :
										t('outcome').toLowerCase()
								}}</span>
						</td>
						<td v-if="!smAndDown">
							<v-tooltip :activator="`#rec-${rec.id}`" text="Посмотреть запись" location="bottom"
								content-class="bg-tooltip font-weight-medium text-primary" v-slot:activator="{ props }">
								<v-btn :id="`rec-${rec.id}`" color="success" @click="push('/detail/' + rec.id)">
									<v-icon v-bind="props" :icon="mdiOpenInNew" />
								</v-btn>
							</v-tooltip>
						</td>
					</tr>
				</v-hover>
			</template>
		</tbody>
	</v-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { mdiOpenInNew, mdiTrendingUp, mdiTrendingDown, mdiMenuUp, mdiMenuDown } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useInfoStore } from '@/stores/info';
import { RecordWithCategory } from '@/views/history.vue';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { useDisplay } from 'vuetify';

const props = withDefaults(defineProps<{
	records: RecordWithCategory[],
	startIndex?: number,
	sortProp?: keyof RecordWithCategory,
	sortType?: 'asc' | 'desc',
}>(), {
	startIndex: 1,
});

const emit = defineEmits<{
	sort: [prop: keyof RecordWithCategory]
}>();

const { t, d, n } = useI18n({ inheritLocale: true, useScope: 'global' });
const { push } = useRouter();
const { smAndDown, xs } = useDisplay();
const { cf } = useCurrencyFilter();
const { userCurrency } = storeToRefs(useInfoStore());

const triggerSort = (prop: keyof RecordWithCategory) => {
	if (Object.keys(props.records[0]).includes(prop)) {
		emit('sort', prop);
	}
};
const tableHeaders = computed(() => (['amount', 'date', 'category', 'type', smAndDown.value ? '' : 'open'].filter(Boolean)));
</script>

<style lang="scss" scoped>
.records-table {
	& thead tr th {
		cursor: pointer;
	}
	& tbody tr {
		cursor: pointer;
		transition: all 0.2s ease-in 0s;
	}
	& .record {
		&-category {
			max-width: 400px;
			overflow: hidden;
			text-overflow: ellipsis;
			@media(max-width: 1600px) {
				max-width: 380px;
			}
			@media(max-width: 1280px) {
				max-width: 320px;
			}
			@media(max-width: 960px) {
				max-width: 260px;
			}
			@media(max-width: 760px) {
				max-width: 200px;
			}
			@media(max-width: 640px) {
				max-width: 150px;
			}
		}
	}
}
</style>