<template>
	<v-data-table-server
		color="background"
		:items-per-page="perPage"
		v-model:page="page"
		v-model:sort-by="sortBy"
		:headers="tableHeaders"
		:items-length="totalRecords || records.length"
		:items="records"
		item-value="id"
		:loading="loading"
		:sort-desc-icon="mdiMenuDown"
		:sort-asc-icon="mdiMenuUp"
		hover
		:row-props="{ class: 'record-row' }"
		:cell-props="{ class: 'text-left' }"
		class="records-table"
		@click:row="openRecord">
		<template #headers="{ columns, isSorted, getSortIcon, toggleSort }">
			<tr>
				<template v-for="(column, idx) in columns" :key="column.key ?? idx">
					<td>
						<span
							class="mr-2 cursor-pointer"
							@click="column.sortable ? toggleSort(column) : null"
							>{{
								$te(column.title ?? '') ? $t(column.title as string) : column.title
							}}</span
						>
						<template v-if="isSorted(column)">
							<v-icon :icon="getSortIcon(column)" />
						</template>
					</td>
				</template>
			</tr>
		</template>
		<template #item.index="{ index }">
			{{ (+page - 1) * +perPage + index + 1 }}
		</template>

		<template #item.amount="{ item: record }">
			{{ $n(cf(record.amount), { key: 'currency', currency: userCurrency }) }}
		</template>

		<template #item.created_at="{ item: record }">
			{{ $d(new Date(record.created_at), smAndDown ? 'shortdate' : 'short') }}
		</template>

		<template #item.category_id="{ item: record }">
			<span class="text-truncate">{{ record.category?.title ?? '' }}</span>
		</template>

		<template #item.type="{ item: record }">
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
							? $t('income').toLowerCase()
							: $t('outcome').toLowerCase()
				}}</span
			>
		</template>

		<template #item.open="{ item }">
			<v-tooltip
				:text="$t('open_record')"
				location="bottom"
				open-delay="300"
				content-class="bg-tooltip font-weight-medium text-primary">
				<template #activator="{ props }">
					<v-btn v-bind="props" color="success" @click.stop="openRecord($event, { item })">
						<v-icon :icon="mdiOpenInNew" />
					</v-btn>
				</template>
			</v-tooltip>
		</template>

		<template #bottom="{ pageCount }">
			<v-pagination
				v-model="page"
				:length="pageCount"
				:total-visible="xs ? 3 : 4"
				class="mt-4"
				density="comfortable"
				:size="xs ? 'small' : 'default'"
				color="primary"
				:disabled="loading" />
		</template>
	</v-data-table-server>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { mdiOpenInNew, mdiTrendingUp, mdiTrendingDown, mdiMenuUp, mdiMenuDown } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import { useCurrencyFilter } from '@/composables/currency-filter';
import { useDisplay, type DataTableHeader, type DataTableSortItem } from 'vuetify';
import { defaultRecordsPerPage } from '@/constants/app';
import type { RecordWithCategory } from '@/api/record';
import { useRouter } from 'vue-router';

const {
	records,
	totalRecords = 0,
	loading,
} = defineProps<{
	records: RecordWithCategory[];
	totalRecords?: number;
	loading?: boolean;
}>();

const perPage = defineModel<string | number>('perPage', {
	default: defaultRecordsPerPage,
});
const page = defineModel<number>('page', { default: 1 });
const sortBy = defineModel<DataTableSortItem[]>('sortBy');

const { xs, smAndDown } = useDisplay();

const tableHeaders = computed(() =>
	(
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
		] as NonNullable<DataTableHeader[]>
	).filter(Boolean)
);

const cf = useCurrencyFilter();
const { userCurrency } = storeToRefs(useUserStore());

const router = useRouter();

const openRecord = (event: MouseEvent, { item: record }: { item: RecordWithCategory }) => {
	router.push({ name: '//records/[id]', params: { id: record.id } });
};
</script>
