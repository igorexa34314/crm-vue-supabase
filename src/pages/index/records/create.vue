<template>
	<div>
		<div class="title">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">
				{{ $t('pageTitles.newRecord') }}
			</h3>
		</div>

		<app-loader v-if="categoriesState.status === 'pending'" class="mt-10" page />

		<div
			v-else-if="categoriesState.status === 'success' && !categoriesState.data.length"
			class="mt-10 text-center text-h6">
			{{ $t('no_categories') + '. ' }}
			<router-link to="/categories">{{ $t('create_category') }}</router-link>
		</div>

		<CreateRecord
			v-else-if="categoriesState.status === 'success'"
			:categories="categoriesState.data"
			:default-amount="defaultRecordAmount" />
	</div>
</template>

<script setup lang="ts">
import CreateRecord from '@/components/record/CreateRecord.vue';
import { useSeoMeta } from '@unhead/vue';
import { useI18n } from 'vue-i18n';
import { defaultRecordAmount } from '@/constants/app';
import { useCategoriesQuery } from '@/queries/category';

const { t } = useI18n({ useScope: 'global' });

useSeoMeta({ title: () => t('pageTitles.newRecord') });

const { state: categoriesState } = useCategoriesQuery();
</script>
