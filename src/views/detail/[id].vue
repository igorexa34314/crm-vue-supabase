<template>
	<div>
		<app-loader v-if="isLoading" page />
		<div v-else-if="record">
			<v-breadcrumbs :items="breadcrumbs" #divider>
				<v-icon :icon="mdiChevronRight" />
			</v-breadcrumbs>

			<v-row class="mt-4">
				<v-col cols="6" md="6" sm="10" class="v-col-xs-12">
					<v-card class="pa-3" :color="record.type === 'outcome' ? 'red-lighten-1' : 'light-green-lighten-1'">
						<v-card-text class="text-subtitle-1 text-primary">
							<p>{{ t('description') + ': ' + record.description }}</p>
							<p class="mt-3">{{ t('amount') + ': ' + n(cf((record.amount)), 'currency', userCurrency)
							}}
							</p>

							<p class="mt-3 mb-5">{{ t('category') + ': ' + record.category?.title }}</p>

							<div v-if="record.details?.length" class="record__details mt-4">
								<p class="mb-4">{{ t('record_details') }}</p>
								<p v-for="detail in record.details" class="record__detail mb-2 text-fixed">
									<span @click="downloadDetail(detail)" class="record__detail-download">{{
										detail.fullname
									}}</span>
								</p>
							</div>
							<a hidden ref="linkEl" v-bind="downloadState"></a>
							<small class="text-right d-block mr-1">{{ d(record.created_at, 'short')
							}}</small>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</div>
		<div v-else class="mt-7 text-center text-primary text-h6">
			<strong>
				{{ `${t('record_with_id')}:` }} <span class="text-decoration-underline font-italic">
					{{ route.params.id }}</span>
				{{ t('not_found') }}
			</strong>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useAsyncState } from '@vueuse/core';
import { useRoute } from 'vue-router';
import { useMeta } from 'vue-meta';
import { mdiChevronRight } from '@mdi/js';
import { RecordService } from '@/services/record';
import { useI18n } from 'vue-i18n';
import { useInfoStore } from '@/stores/info';
import { useSnackbarStore } from '@/stores/snackbar';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { RecordDetail } from '@/services/record';

interface Breadcrumbs {
	title: string;
	to?: string;
	disabled?: boolean
}

const route = useRoute();
const { t, d, n } = useI18n({ inheritLocale: true, useScope: 'global' });
const { cf } = useCurrencyFilter();
useMeta({ title: 'pageTitles.details' });
const { userCurrency } = storeToRefs(useInfoStore());

const breadcrumbs = computed<Breadcrumbs[]>(() => ([
	{ title: t('menu.history'), to: '/history' },
	{ title: record.value?.type === 'income' ? 'Доход' : 'Расход', disabled: true }
].filter(Boolean)));

const { state: record, isLoading } = useAsyncState(async () => {
	return RecordService.fetchRecordById(route.params.id as string);
}, undefined, {
	onError: (e) => {
		console.error(e);
		const { showMessage } = useSnackbarStore();
		showMessage('no_record_found');
	}
});

const linkEl = ref<HTMLLinkElement>();
const downloadState = ref({
	href: '',
	download: ''
});
const downloadDetail = async (detail: RecordDetail) => {
	const downloadURL = await RecordService.downloadRecordDetail(detail);
	downloadState.value = { href: downloadURL || detail.public_url || '', download: detail.fullname };
	await nextTick();
	linkEl.value?.click();
}
</script>

<style lang="scss" scoped>
.record__detail-download {
	cursor: pointer;
	transition: all 0.2s ease-in-out 0s;
	&:hover {
		color: blue;
		text-decoration: underline;
	}
}
</style>
