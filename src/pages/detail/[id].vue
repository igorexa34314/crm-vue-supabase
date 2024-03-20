<template>
	<div>
		<PageBreadcrumbs :breadcrumbs="breadcrumbs" />

		<app-loader v-if="isLoading" page />

		<v-card v-else-if="record" class="mt-4 pa-3" max-width="800" color="card-1">
			<div class="card-header d-flex justify-space-between">
				<v-card-title class="flex-fill d-flex">
					<div>
						{{
							(!xs ? `${t('pageTitles.details')} - ` : '') +
							`${record.category.title} (${t(record.type).toLowerCase()})`
						}}
					</div>
					<span
						:class="record.type === 'outcome' ? 'bg-red-darken-4' : 'bg-green-darken-2'"
						class="ml-3 pb-1 px-2 text-center text-trend">
						<v-icon :icon="record.type === 'outcome' ? mdiTrendingDown : mdiTrendingUp" color="title" />
					</span>
				</v-card-title>
				<div class="card-header-actions d-flex justify-end">
					<v-btn
						:icon="mdiPencil"
						:size="xs ? '46px' : 'default'"
						variant="text"
						color="primary"
						@click="updateRecordDialog = true" />
					<v-btn
						:icon="mdiDelete"
						:size="xs ? '46px' : 'default'"
						variant="text"
						color="primary"
						@click="confirmationDialog = true" />
				</div>
			</div>

			<v-card-text class="mt-4 text-h6 text-primary">
				<p>{{ t('description') + ': ' + record.description }}</p>
				<p class="mt-4">
					{{ t('amount') + ': ' + n(cf(record.amount), { key: 'currency', currency: userCurrency }) }}
				</p>

				<p class="mt-4 mb-5">{{ t('category') + ': ' + record.category.title }}</p>

				<RecordDetails
					v-if="record.details?.length"
					:details="record.details"
					class="record__details mt-4 mt-sm-6" />

				<small class="text-right d-block mt-4 mt-sm-6 mr-1">
					{{
						d(record.created_at, 'short') +
						(record.updated_at ? ` (${t('updated_short')}. ${d(record.updated_at, 'short')})` : '')
					}}
				</small>
			</v-card-text>

			<UpdateRecordDialog
				v-if="updateRecordDialog"
				v-model="updateRecordDialog"
				:record="record"
				@update-record="handleRecordUpdate" />

			<DeleteRecordDialog v-model="confirmationDialog" @delete-record="deleteRecord" />
		</v-card>

		<div v-else class="mt-7 text-center text-primary text-h6">
			<strong>
				{{ `${t('record_with_id')}: ` }}
				<span class="text-decoration-underline font-italic">{{ route.params.id }}</span>
				{{ t('not_found') }}
			</strong>
		</div>
	</div>
</template>

<script setup lang="ts">
import PageBreadcrumbs, { type Breadcrumb } from '@/components/UI/PageBreadcrumbs.vue';
import RecordDetails from '@/components/record/RecordDetails.vue';
import { mdiTrendingUp, mdiTrendingDown, mdiDelete, mdiPencil } from '@mdi/js';
import { ref, computed, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { useAsyncState } from '@vueuse/core';
import { useRouter, useRoute } from 'vue-router/auto';
import { useHead } from '@unhead/vue';
import {
	fetchRecordById,
	deleteRecordById,
	updateRecord,
	type RecordDataToUpdate,
	type RecordWithDetails,
} from '@/api/record';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import { useSnackbarStore } from '@/stores/snackbar';
import { useCurrencyFilter } from '@/composables/currencyFilter';
import { useDisplay } from 'vuetify';

useHead({ title: 'pageTitles.details' });

const DeleteRecordDialog = defineAsyncComponent(() => import('@/components/record/DeleteRecordDialog.vue'));
const UpdateRecordDialog = defineAsyncComponent(() => import('@/components/record/UpdateRecordDialog.vue'));

const route = useRoute('/detail/[id]');
const router = useRouter();
const { t, d, n } = useI18n({ useScope: 'global' });
const { cf } = useCurrencyFilter();
const { xs } = useDisplay();
const { showMessage } = useSnackbarStore();
const { info, userCurrency } = storeToRefs(useUserStore());

const breadcrumbs = computed<Breadcrumb[]>(() => [
	{ title: t('menu.history'), to: '/history' },
	{ title: record.value?.type === 'income' ? 'Доход' : 'Расход', disabled: true },
]);

const { state: record, isLoading } = useAsyncState(fetchRecordById(route.params.id), null, {
	onError: e => {
		console.error(e);
		showMessage('no_record_found', 'red-darken-3');
	},
});

const confirmationDialog = ref(false);
const canDeleteRecord = computed(
	() => record.value?.type === 'outcome' || info.value!.bill >= (record.value?.amount || 0)
);
const deleteRecord = async () => {
	if (canDeleteRecord.value) {
		try {
			await deleteRecordById(record.value?.id ?? route.params.id);
			showMessage(t('record_deleted_succesfully'));
			router.push('/history');
		} catch (err) {
			showMessage(t('error_delete_record'), 'red-darken-3');
		}
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
const handleRecordUpdate = async (recordData: RecordDataToUpdate) => {
	try {
		isLoading.value = true;
		const updatedRecord = await updateRecord(record.value?.id || route.params.id, recordData);
		record.value = { ...record.value, ...updatedRecord } as RecordWithDetails;
		showMessage(t('record_updated_succesfully'));
	} catch (err) {
		showMessage(t('error_update_record'), 'red-darken-3');
	} finally {
		isLoading.value = false;
	}
};
</script>
