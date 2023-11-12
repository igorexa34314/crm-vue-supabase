<template>
	<v-data-table-server
		color="background"
		v-model:page="page"
		v-model:items-per-page="perPage"
		:headers="tableHeaders"
		:items-length="totalRecords || records.length"
		:items="records"
		:loading="loading"
		:sort-desc-icon="mdiMenuDown"
		:sort-asc-icon="mdiMenuUp"
		hide-default-footer
		class="records-table elevation-1"
		item-value="name"
		@update:options="loadItems">
		<template #headers="{ columns, isSorted, getSortIcon, toggleSort }">
			<tr>
				<template v-for="column in columns" :key="column.key">
					<td>
						<span class="mr-2 cursor-pointer" @click="column.sortable ? toggleSort(column) : null">{{
							te(column.title ?? '') ? t(column.title as string) : column.title
						}}</span>
						<template v-if="isSorted(column)">
							<v-icon :icon="getSortIcon(column)" />
						</template>
					</td>
				</template>
			</tr>
		</template>
		<template #item="{ item: record }: { item: RecordWithCategory & { index: number } }">
			<v-hover #default="{ isHovering, props }">
				<tr
					v-bind="props"
					@click="push({ name: '/detail/[id]', params: { id: record.id } })"
					:class="{ 'bg-hover': isHovering }"
					class="record">
					<td>{{ record.index }}</td>
					<td>{{ n(cf(record.amount), { key: 'currency', currency: userCurrency }) }}</td>
					<td>{{ d(record.created_at, smAndDown ? 'shortdate' : 'short') }}</td>
					<td class="record-category text-truncate">{{ record.category.title }}</td>
					<td>
						<span
							:class="record.type === 'outcome' ? 'bg-red-darken-4' : 'bg-green-darken-2'"
							class="py-2 px-3 text-center text-trend">
							<v-icon
								:icon="record.type === 'outcome' ? mdiTrendingDown : mdiTrendingUp"
								:class="{ 'mr-2': !smAndDown }"
								:size="xs ? 'small' : 'default'" />
							{{
								smAndDown
									? ''
									: record.type === 'income'
									? t('income').toLowerCase()
									: t('outcome').toLowerCase()
							}}</span
						>
					</td>
					<td v-if="!smAndDown">
						<v-tooltip
							:activator="`#rec-${record.id}`"
							text="Посмотреть запись"
							location="bottom"
							content-class="bg-tooltip font-weight-medium text-primary">
							<template #activator="{ props }">
								<v-btn
									:id="`rec-${record.id}`"
									color="success"
									:to="{ name: '/detail/[id]', params: { id: record.id } }">
									<v-icon v-bind="props" :icon="mdiOpenInNew" />
								</v-btn>
							</template>
						</v-tooltip>
					</td>
				</tr>
			</v-hover>
		</template>

		<template #bottom="{ pageCount }">
			<v-pagination
				v-if="pageCount > 1"
				v-model="page"
				:length="pageCount"
				:total-visible="xs ? 3 : 4"
				class="mt-4"
				density="comfortable"
				:size="xs ? 'small' : 'default'"
				color="primary"
				:disabled="loading" />
		</template>
		<template #loading></template>
	</v-data-table-server>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router/auto';
import { mdiOpenInNew, mdiTrendingUp, mdiTrendingDown, mdiMenuUp, mdiMenuDown } from '@mdi/js';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { useDisplay } from 'vuetify';
import { DEFAULT_RECORDS_PER_PAGE } from '@/global-vars';
import type { VDataTableServer } from 'vuetify/components';
import type { RecordWithCategory } from '@/api/record';

export type SortEmitData = Pick<VDataTableServer, 'page' | 'itemsPerPage'> & {
	sortBy?: Partial<VDataTableServer['sortBy'][number]>[];
};

const {
	records,
	totalRecords = 0,
	loading = false,
} = defineProps<{
	records: (RecordWithCategory & { index: number })[];
	totalRecords?: VDataTableServer['itemsLength'];
	loading?: boolean;
}>();

const emit = defineEmits<{
	sort: [data: SortEmitData];
}>();

const perPage = defineModel<VDataTableServer['itemsPerPage']>('perPage', {
	default: DEFAULT_RECORDS_PER_PAGE,
});

const page = ref(1);
const tableHeaders = computed(
	() =>
		[
			{
				title: '#',
				align: 'start',
				sortable: false,
				key: 'index',
			},
			{ title: 'amount', key: 'amount', align: 'end' },
			{ title: 'date', key: 'created_at', align: 'end' },
			{ title: 'category', key: 'category_id', align: 'end' },
			{ title: 'type', key: 'type', align: 'end' },
			!smAndDown.value ? { title: 'open', key: 'open', align: 'end', sortable: false } : false,
		].filter(Boolean) as VDataTableServer['headers']
);

const loadItems: VDataTableServer['onUpdate:options'] = ({ page, itemsPerPage, sortBy }: SortEmitData) => {
	emit('sort', { page, itemsPerPage, sortBy });
};

const { te, t, d, n } = useI18n();
const { push } = useRouter();
const { smAndDown, xs } = useDisplay();
const { cf } = useCurrencyFilter();
const { userCurrency } = storeToRefs(useUserStore());
</script>

<style lang="scss" scoped>
.records-table {
	& thead tr td span {
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
