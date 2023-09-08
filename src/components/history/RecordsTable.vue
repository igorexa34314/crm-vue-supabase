<template>
	<v-table class="records-table" :density="xs ? 'comfortable' : 'default'" disabled>
		<thead class="text-title">
			<tr>
				<th>{{ '#' }}</th>
				<th v-for="h in tableHeaders" :key="h.title">
					<span @click="triggerSort(h.sortValue)">{{ t(h.title) }}</span>
					<v-icon
						v-if="sortField === h.sortValue"
						:icon="sortType === 'asc' ? mdiMenuUp : mdiMenuDown"
						size="small"
						class="ml-1"
						@click="triggerSort(h.sortValue)" />
				</th>
			</tr>
		</thead>
		<tbody class="text-primary">
			<template v-for="rec in records" :key="rec.id">
				<v-hover #default="{ isHovering, props }">
					<tr
						@click="push({ name: '/detail/[id]', params: { id: rec.id } })"
						class="record"
						v-bind="props"
						:class="isHovering ? 'bg-hover' : ''">
						<td>{{ rec.index }}</td>
						<td>{{ n(cf(rec.amount), { key: 'currency', currency: userCurrency }) }}</td>
						<td>{{ d(rec.created_at, smAndDown ? 'shortdate' : 'short') }}</td>
						<td class="record-category text-truncate">{{ rec.category.title }}</td>
						<td>
							<span
								:class="rec.type === 'outcome' ? 'bg-red-darken-4' : 'bg-green-darken-2'"
								class="py-2 px-3 text-center text-trend">
								<v-icon
									:icon="rec.type === 'outcome' ? mdiTrendingDown : mdiTrendingUp"
									:class="{ 'mr-2': !smAndDown }"
									:size="xs ? 'small' : 'default'" />
								{{
									smAndDown
										? ''
										: rec.type === 'income'
										? t('income').toLowerCase()
										: t('outcome').toLowerCase()
								}}</span
							>
						</td>
						<td v-if="!smAndDown">
							<v-tooltip
								:activator="`#rec-${rec.id}`"
								text="Посмотреть запись"
								location="bottom"
								content-class="bg-tooltip font-weight-medium text-primary">
								<template #activator="{ props }">
									<v-btn
										:id="`rec-${rec.id}`"
										color="success"
										@click="push({ name: '/detail/[id]', params: { id: rec.id } })">
										<v-icon v-bind="props" :icon="mdiOpenInNew" />
									</v-btn>
								</template>
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
import { useRouter } from 'vue-router/auto';
import { mdiOpenInNew, mdiTrendingUp, mdiTrendingDown, mdiMenuUp, mdiMenuDown } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { useDisplay } from 'vuetify';
import { VTable, VTooltip, VHover } from 'vuetify/components';
import { RecordWithCategory, SortFields, SortType } from '@/services/record';

const props = withDefaults(
	defineProps<{
		records: (RecordWithCategory & { index: number })[];
		sortField?: SortFields;
		sortType?: SortType;
	}>(),
	{
		sortField: 'created_at',
		sortType: 'desc',
	}
);

const emit = defineEmits<{
	sort: [field: SortFields];
}>();

const { t, d, n } = useI18n();
const { push } = useRouter();
const { smAndDown, xs } = useDisplay();
const { cf } = useCurrencyFilter();
const { userCurrency } = storeToRefs(useUserStore());

const triggerSort = (field?: SortFields) => {
	if (field) {
		emit('sort', field);
	}
};
const tableHeaders = computed(
	() =>
		[
			{ title: 'amount', sortValue: 'amount' },
			{ title: 'date', sortValue: 'created_at' },
			{ title: 'category', sortValue: 'category_id' },
			{ title: 'type', sortValue: 'type' },
			{ title: smAndDown.value ? '' : 'open' },
		].filter(h => !!h.title) as { title: string; sortValue?: SortFields }[]
);
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
			@media (max-width: 1600px) {
				max-width: 380px;
			}
			@media (max-width: 1280px) {
				max-width: 320px;
			}
			@media (max-width: 960px) {
				max-width: 260px;
			}
			@media (max-width: 760px) {
				max-width: 200px;
			}
			@media (max-width: 640px) {
				max-width: 150px;
			}
		}
	}
}
</style>
