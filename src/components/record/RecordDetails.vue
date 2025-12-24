<template>
	<v-expansion-panels class="record__details">
		<v-expansion-panel bg-color="panel">
			<v-expansion-panel-title class="text-subtitle-1">{{
				$t('record_details')
			}}</v-expansion-panel-title>
			<v-expansion-panel-text>
				<div class="mt-2 d-flex flex-wrap">
					<v-hover v-for="detail in details" :key="detail.id" #default="{ isHovering, props }">
						<a
							v-bind="props"
							class="record-detail cursor-pointer mb-2 text-fixed d-flex flex-column align-center"
							:class="{ 'mr-3': details.length > 1 }"
							:title="detail.fullname"
							@click.prevent="downloadDetail(detail)">
							<div class="record-detail__file">
								<small
									v-if="!isHovering"
									class="record-detail__ext text-truncate text-primary"
									>{{ arrayAt(detail.fullname.split('.'), -1) }}</small
								>
								<v-icon :icon="mdiFile" size="88px" color="file-icon" />
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
								class="record-detail__filename text-title text-center text-subtitle-2 w-100"
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

<style lang="scss" scoped>
.record-detail {
	max-width: 100px;
	&__file {
		position: relative;
	}
	&__ext {
		margin: 0 auto;
		max-width: 75%;
		display: inline-block;
		position: absolute;
		left: 0;
		text-align: center;
		right: 0;
		top: 50%;
		z-index: 100;
		transform: translateY(-25%);
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
