<template>
	<div>
		<PageBreadcrumbs :breadcrumbs="breadcrumbs" />

		<app-loader v-if="recordState.status === 'pending' || isLoading" page />

		<v-card
			v-else-if="recordState.status === 'success' && recordState.data && record"
			class="mt-4 p-3"
			max-width="800"
			color="card-1">
			<div class="flex justify-between">
				<v-card-title class="flex grow">
					<div>
						{{
							(!xs ? `${$t('pageTitles.details')} - ` : '') +
							`${record.category?.title} (${$t(record.type).toLowerCase()})`
						}}
					</div>
					<span
						:class="record.type === 'outcome' ? 'bg-[#b71c1c]' : 'bg-[#388e3c]'"
						class="text-trend ml-3 px-2 pb-1 text-center">
						<v-icon
							:icon="record.type === 'outcome' ? 'i-mdi-trending-down' : 'i-mdi-trending-up'"
							color="title" />
					</span>
				</v-card-title>
				<div class="flex justify-end">
					<v-btn
						icon="i-mdi-pencil"
						:size="xs ? '46px' : 'default'"
						variant="text"
						color="primary"
						@click="updateRecordDialog = true" />
					<v-btn
						icon="i-mdi-delete"
						:size="xs ? '46px' : 'default'"
						variant="text"
						color="primary"
						@click="confirmationDialog = true" />
				</div>
			</div>

			<v-card-text class="text-headline-small text-primary mt-4">
				<p>{{ $t('description') + ': ' + record.description }}</p>
				<p class="mt-4">
					{{
						$t('amount') +
						': ' +
						$n(cf(record.amount), { key: 'currency', currency: userCurrency })
					}}
				</p>

				<p class="mb-5 mt-4">{{ $t('category') + ': ' + record.category?.title }}</p>

				<RecordDetails
					v-if="record.details?.length"
					:details="record.details"
					class="mt-4 sm:mt-6" />

				<small class="mr-1 mt-4 text-right block sm:mt-6">
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
				:user-currency="userCurrency"
				:bill="userInfo?.bill"
				:record="record"
				:loading="updateRecordAsyncStatus === 'loading'"
				@update-record="tryUpdateRecord" />

			<DeleteRecordDialog
				v-model="confirmationDialog"
				:loading="deleteRecordAsyncStatus === 'loading'"
				@delete-record="tryDeleteRecord" />
		</v-card>

		<div v-else class="text-headline-small text-primary mt-7 text-center">
			<strong>
				{{ `${$t('record_with_id')}: ` }}
				<span class="underline font-italic">{{ route.params.id }}</span>
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
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useSeoMeta } from '@unhead/vue';
import { useI18n } from 'vue-i18n';
import { useSnackbarStore } from '@/stores/snackbar';
import { useCurrencyFilter } from '@/composables/currency-filter';
import { useRecordByIdQuery } from '@/queries/record';
import { useDeleteRecord, useUpdateRecord } from '@/mutations/record';
import { useDisplay } from 'vuetify';
import { useUserInfoQuery } from '@/queries/user';
import type { RecordDataToUpdate } from '@/api/record';

const { xs } = useDisplay();
const route = useRoute('//records/[id]');
const router = useRouter();
const { userInfo, userCurrency } = useUserInfoQuery();
const { t, n } = useI18n();
const cf = useCurrencyFilter();
const { showErrorMessage } = useSnackbarStore();

useSeoMeta({ title: () => t('pageTitles.details') });

const isLoading = ref(false);

const { state: recordState, data: record } = useRecordByIdQuery();

const breadcrumbs = computed<Breadcrumb[]>(() => [
	{ title: t('menu.history'), to: '/records' },
	{ title: record.value?.type === 'income' ? 'Доход' : 'Расход', disabled: true },
]);

const confirmationDialog = ref(false);
const canDeleteRecord = computed(
	() => record.value?.type === 'outcome' || userInfo.value!.bill >= (record.value?.amount || 0)
);

const { mutateAsync: updateRecord, asyncStatus: updateRecordAsyncStatus } = useUpdateRecord();
const { mutateAsync: deleteRecord, asyncStatus: deleteRecordAsyncStatus } = useDeleteRecord();

const tryDeleteRecord = async () => {
	if (canDeleteRecord.value) {
		await deleteRecord(record.value?.id ?? route.params.id);
		router.push('/records');
	} else {
		showErrorMessage(
			t('lack_of_amount') +
				` (${n(cf((record.value?.amount || 0) - userInfo.value!.bill), {
					key: 'currency',
					currency: userCurrency.value,
				})})`
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
