<template>
	<div>
		<v-breadcrumbs :items="breadcrumbs">
			<template #divider>
				<v-icon :icon="mdiChevronRight" />
			</template>
		</v-breadcrumbs>

		<app-loader v-if="isLoading" page />
		<v-card v-else-if="record" class="mt-4 pa-3" max-width="800" color="card-1">
			<!-- <template #image>
				<v-icon
					:icon="record.type === 'outcome' ? mdiTrendingDown : mdiTrendingUp"
					size="80px"
					color="title"
					class="mx-auto my-auto"
					style="opacity: 0.5" />
			</template> -->
			<div class="card-header d-flex justify-space-between">
				<v-card-title class="flex-fill d-flex">
					<div>
						{{ `${t('pageTitles.details')} - ${record.category.title} (${t(record.type).toLocaleLowerCase()})` }}
					</div>
					<span
						:class="record.type === 'outcome' ? 'bg-red-darken-4' : 'bg-green-darken-2'"
						class="ml-3 pb-1 px-2 text-center text-trend">
						<v-icon :icon="record.type === 'outcome' ? mdiTrendingDown : mdiTrendingUp" />
					</span>
				</v-card-title>
				<div class="card-header-actions">
					<v-btn variant="text" :icon="mdiPencil" color="primary" />
					<v-btn variant="text" :icon="mdiDelete" color="primary" />
				</div>
			</div>

			<v-card-text class="mt-4 text-h6 text-primary">
				<p>{{ t('description') + ': ' + record.description }}</p>
				<p class="mt-3">
					{{ t('amount') + ': ' + n(cf(record.amount), { key: 'currency', currency: userCurrency }) }}
				</p>

				<p class="mt-3 mb-5">{{ t('category') + ': ' + record.category.title }}</p>

				<v-expansion-panels v-if="record.details?.length" class="record__details mt-4 mt-sm-6" color="card-2">
					<v-expansion-panel>
						<v-expansion-panel-title class="text-subtitle-1">{{ t('record_details') }}</v-expansion-panel-title>
						<v-expansion-panel-text>
							<div class="mt-2 d-flex flex-wrap">
								<v-hover v-for="detail in record.details" :key="detail.id" #default="{ isHovering, props }">
									<div
										v-bind="props"
										class="record-detail mb-2 text-fixed d-flex flex-column align-center"
										:class="{ 'mr-3': record.details.length > 1 }"
										@click="downloadDetail(detail)">
										<div class="record-detail__file">
											<small v-if="!isHovering" class="record-detail__ext text-primary">{{
												detail.fullname.split('.').at(-1)
											}}</small>
											<v-icon :icon="mdiFile" size="88px" />
											<v-fade-transition>
												<v-icon
													v-if="isHovering"
													:icon="mdiDownload"
													class="download-icon"
													size="24px"
													color="primary" />
											</v-fade-transition>
										</div>
										<span
											class="record-detail__filename text-subtitle-2 w-100 text-truncate"
											:style="{ 'text-decoration': isHovering ? 'underline' : 'none' }"
											>{{ detail.fullname }}</span
										>
									</div>
								</v-hover>
							</div>
						</v-expansion-panel-text>
					</v-expansion-panel>
					<a hidden ref="linkEl" v-bind="downloadState"></a>
				</v-expansion-panels>

				<small class="text-right d-block mt-4 mt-sm-6 mr-1">
					{{ d(record.created_at, 'short') + (record.updated_at ? ` (${d(record.updated_at, 'short')})` : '') }}
				</small>
			</v-card-text>
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
import { mdiTrendingUp, mdiTrendingDown, mdiDelete, mdiPencil, mdiFile, mdiDownload } from '@mdi/js';
import { ref, computed, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useAsyncState } from '@vueuse/core';
import { useRoute } from 'vue-router/auto';
import { useMeta } from 'vue-meta';
import { mdiChevronRight } from '@mdi/js';
import { RecordService } from '@/services/record';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import { useSnackbarStore } from '@/stores/snackbar';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { RecordDetail } from '@/services/record';
import { RouteNamedMap } from 'vue-router/auto/routes';
import {
	VBreadcrumbs,
	VExpansionPanel,
	VExpansionPanels,
	VExpansionPanelTitle,
	VExpansionPanelText,
	VHover,
	VFadeTransition,
} from 'vuetify/components';

interface Breadcrumbs {
	title: string;
	to?: keyof RouteNamedMap;
	disabled?: boolean;
}

useMeta({ title: 'pageTitles.details' });

const route = useRoute('/detail/[id]');
const { t, d, n } = useI18n({ useScope: 'global' });
const { cf } = useCurrencyFilter();
const { userCurrency } = storeToRefs(useUserStore());

const breadcrumbs = computed<Breadcrumbs[]>(() =>
	(
		[
			{ title: t('menu.history'), to: '/history' },
			{ title: record.value?.type === 'income' ? 'Доход' : 'Расход', disabled: true },
		] as Breadcrumbs[]
	).filter(Boolean)
);

const { state: record, isLoading } = useAsyncState(
	async () => {
		return RecordService.fetchRecordById(route.params.id as string);
	},
	null,
	{
		onError: e => {
			console.error(e);
			const { showMessage } = useSnackbarStore();
			showMessage('no_record_found', 'red-darken-3');
		},
	}
);

const linkEl = ref<HTMLLinkElement>();
const downloadState = ref({
	href: '',
	download: '',
});
const downloadDetail = async (detail: RecordDetail) => {
	const downloadURL = await RecordService.downloadRecordDetail(detail.fullpath);
	downloadState.value = { href: downloadURL || detail.public_url || '', download: detail.fullname };
	await nextTick();
	linkEl.value?.click();
};
</script>

<style lang="scss" scoped>
.record-detail {
	cursor: pointer;
	max-width: 100px;
	&__file {
		position: relative;
	}
	&__ext {
		display: inline-block;
		position: absolute;
		left: 50%;
		top: 50%;
		z-index: 100;
		transform: translate(-50%, -25%);
	}
}
.download-icon {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -25%);
	z-index: 100;
}
</style>
