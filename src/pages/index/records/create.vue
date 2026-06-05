<template>
	<div>
		<div>
			<h3 class="text-headline-medium text-title ml-2 mt-2 sm:text-headline-large sm:mt-4">
				{{ $t('pageTitles.newRecord') }}
			</h3>
		</div>

		<app-loader v-if="categoriesState.status === 'pending'" class="mt-10" page />

		<div
			v-else-if="categoriesState.status === 'success' && !categoriesState.data.length"
			class="text-headline-small mt-10 text-center">
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

const { t } = useI18n();

useSeoMeta({ title: () => t('pageTitles.newRecord') });

const { state: categoriesState } = useCategoriesQuery();
</script>
