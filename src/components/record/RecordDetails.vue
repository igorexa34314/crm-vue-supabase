<template>
	<v-expansion-panels>
		<v-expansion-panel bg-color="panel">
			<v-expansion-panel-title class="text-body-large">{{
				$t('record_details')
			}}</v-expansion-panel-title>
			<v-expansion-panel-text>
				<div class="mt-2 flex flex-wrap">
					<v-hover v-for="detail in details" :key="detail.id" #default="{ isHovering, props }">
						<a
							v-bind="props"
							class="text-fixed mb-2 flex flex-col max-w-[100px] cursor-pointer items-center"
							:class="{ 'mr-3': details.length > 1 }"
							:title="detail.fullname"
							@click.prevent="downloadDetail(detail)">
							<div class="pos-relative">
								<small
									v-if="!isHovering"
									class="text-primary mx-auto text-center max-w-3/4 inline-block text-truncate left-0 right-0 top-1/2 z-100 -translate-y-1/4"
									>{{ arrayAt(detail.fullname.split('.'), -1) }}</small
								>
								<v-icon :icon="mdiFile" size="88px" color="file-icon" />
								<v-fade-transition>
									<v-icon
										v-if="isHovering"
										:icon="mdiDownload"
										class="left-1/2 top-1/2 pos-absolute z-100 -translate-x-1/2 -translate-y-1/2"
										size="24px"
										color="primary" />
								</v-fade-transition>
							</div>
							<span
								class="text-title-small text-title text-center w-100"
								:style="{ 'text-decoration': isHovering ? 'underline' : 'none' }"
								>{{ detail.fullname }}</span
							>
						</a>
					</v-hover>
				</div>
			</v-expansion-panel-text>
		</v-expansion-panel>
	</v-expansion-panels>
</template>

<script setup lang="ts">
import { mdiFile, mdiDownload } from '@mdi/js';
import { downloadRecordDetail, type RecordDetail } from '@/api/record';
import { arrayAt } from '@/utils/helpers';

defineProps<{
	details: RecordDetail[];
}>();

const downloadDetail = async (detail: RecordDetail) => {
	const blob = await downloadRecordDetail(detail.fullpath);
	const downloadURL = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = downloadURL;
	link.download = detail.fullname;
	link.click();
	link.remove();
	URL.revokeObjectURL(downloadURL);
};
</script>
