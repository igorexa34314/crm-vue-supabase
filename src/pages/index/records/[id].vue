<template>
	<div>
		<PageBreadcrumbs :breadcrumbs="breadcrumbs" />

		<app-loader v-if="recordState.status === 'pending' || isLoading" page />

		<v-card
			v-else-if="recordState.status === 'success' && recordState.data && record"
			class="mt-4 pa-3"
			max-width="800"
			color="card-1">
			<div class="card-header d-flex justify-space-between">
				<v-card-title class="flex-fill d-flex">
					<div>
						{{
							(!$vuetify.display.xs ? `${$t('pageTitles.details')} - ` : '') +
							`${record.category?.title} (${$t(record.type).toLowerCase()})`
						}}
					</div>
					<span
						:class="record.type === 'outcome' ? 'bg-red-darken-4' : 'bg-green-darken-2'"
						class="ml-3 pb-1 px-2 text-center text-trend">
						<v-icon
							:icon="record.type === 'outcome' ? mdiTrendingDown : mdiTrendingUp"
							color="title" />
					</span>
				</v-card-title>
				<div class="card-header-actions d-flex justify-end">
					<v-btn
						:icon="mdiPencil"
						:size="$vuetify.display.xs ? '46px' : 'default'"
						variant="text"
						color="primary"
						@click="updateRecordDialog = true" />
					<v-btn
						:icon="mdiDelete"
						:size="$vuetify.display.xs ? '46px' : 'default'"
						variant="text"
						color="primary"
						@click="confirmationDialog = true" />
				</div>
			</div>

			<v-card-text class="mt-4 text-h6 text-primary">
				<p>{{ $t('description') + ': ' + record.description }}</p>
				<p class="mt-4">
					{{
						$t('amount') +
						': ' +
						$n(cf(record.amount), { key: 'currency', currency: userCurrency })
					}}
				</p>

				<p class="mt-4 mb-5">{{ $t('category') + ': ' + record.category?.title }}</p>

				<RecordDetails
					v-if="record.details?.length"
					:details="record.details"
					class="record__details mt-4 mt-sm-6" />

				<small class="text-right d-block mt-4 mt-sm-6 mr-1">
					{{
						$d(new Date(record.created_at), 'short') +
						(record.updated_at
							? ` (${$t('updated_short')}. ${$d(new Date(record.updated_at), 'short')})`
							: '')
					}}
				</small>
			</v-card-text>
			<UpdateRecordDialog
				v-model="updateRecordDialog"
				:record="record"
				:loading="updateRecordAsyncStatus === 'loading'"
				@update-record="tryUpdateRecord" />

			<DeleteRecordDialog
				v-model="confirmationDialog"
				:loading="deleteRecordAsyncStatus === 'loading'"
				@delete-record="tryDeleteRecord" />
		</v-card>

		<div v-else class="mt-7 text-center text-primary text-h6">
			<strong>
				{{ `${$t('record_with_id')}: ` }}
				<span class="text-decoration-underline font-italic">{{ route.params.id }}</span>
				{{ $t('not_found') }}
			</strong>
		</div>
	</div>
</template>

<script setup lang="ts">
import UpdateRecordDialog from '@/components/record/UpdateRecordDialog.vue';
import DeleteRecordDialog from '@/components/record/DeleteRecordDialog.vue';
import PageBreadcrumbs, { type Breadcrumb } from '@/components/ui/PageBreadcrumbs.vue';
import RecordDetails from '@/components/record/RecordDetails.vue';
import { mdiTrendingUp, mdiTrendingDown, mdiDelete, mdiPencil } from '@mdi/js';
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useSeoMeta } from '@unhead/vue';
import { type RecordDataToUpdate } from '@/api/record';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import { useSnackbarStore } from '@/stores/snackbar';
import { useCurrencyFilter } from '@/composables/currency-filter';
import { useRecordByIdQuery } from '@/queries/record';
import { useDeleteRecord, useUpdateRecord } from '@/mutations/record';

const route = useRoute('//records/[id]');
const router = useRouter();
const { t, n } = useI18n({ useScope: 'global' });
const cf = useCurrencyFilter();
const { showMessage } = useSnackbarStore();
const { info, userCurrency } = storeToRefs(useUserStore());

useSeoMeta({ title: () => t('pageTitles.details') });

const isLoading = ref(false);

const { state: recordState, data: record } = useRecordByIdQuery();

const breadcrumbs = computed<Breadcrumb[]>(() => [
	{ title: t('menu.history'), to: '/records' },
	{ title: record.value?.type === 'income' ? 'Доход' : 'Расход', disabled: true },
]);

const confirmationDialog = ref(false);
const canDeleteRecord = computed(
	() => record.value?.type === 'outcome' || info.value!.bill >= (record.value?.amount || 0)
);

const { mutateAsync: updateRecord, asyncStatus: updateRecordAsyncStatus } = useUpdateRecord();
const { mutateAsync: deleteRecord, asyncStatus: deleteRecordAsyncStatus } = useDeleteRecord();

const tryDeleteRecord = async () => {
	if (canDeleteRecord.value) {
		await deleteRecord(record.value?.id ?? route.params.id);
		router.push('/records');
	} else {
		showMessage(
			t('lack_of_amount') +
				` (${n(cf.value((record.value?.amount || 0) - info.value!.bill), {
					key: 'currency',
					currency: userCurrency.value,
				})})`,
			'red-darken-3'
		);
	}
};

const updateRecordDialog = ref(false);

const tryUpdateRecord = async (recordData: RecordDataToUpdate) => {
	await updateRecord({
		id: record.value?.id || route.params.id,
		data: recordData,
	});
	updateRecordDialog.value = false;
};
</script>
