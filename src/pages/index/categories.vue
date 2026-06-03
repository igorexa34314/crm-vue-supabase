<template>
	<div>
		<div class="mb-7">
			<h3 class="text-headline-medium text-title ml-2 mt-2 sm:text-headline-large sm:mt-4">
				{{ $t('pageTitles.categories') }}
			</h3>
		</div>

		<section class="mt-7 sm:mt-10">
			<app-loader v-if="categoriesState.status === 'pending' || isCurrencyPending" page />

			<template v-else-if="categoriesState.status === 'success'">
				<v-row :class="xs ? 'px-2' : 'px-4'">
					<v-col cols="12" md="6" sm="12" class="create-category">
						<CreateCategory
							:default-limit="100"
							:class="{
								'pr-6': !smAndDown,
								'px-3': smAndDown && !xs,
							}" />
					</v-col>

					<v-col cols="12" md="6" sm="12" class="edit-category">
						<EditCategory
							v-if="categoriesState.data.length"
							:categories="categoriesState.data"
							:default-limit="defaultCategoryLimit"
							:class="{
								'pl-6': !smAndDown,
								'px-3': smAndDown && !xs,
							}"
							class="mt-5 md:mt-0 sm:mt-7" />
					</v-col>
				</v-row>
			</template>
		</section>
	</div>
</template>

<script setup lang="ts">
import CreateCategory from '@/components/categories/CreateCategory.vue';
import EditCategory from '@/components/categories/EditCategory.vue';
import { useI18n } from 'vue-i18n';
import { useSeoMeta } from '@unhead/vue';
import { defaultCategoryLimit } from '@/constants/app';
import { useCurrencyQueryState } from '@/queries/currency';
import { useCategoriesQuery } from '@/queries/category';
import { useDisplay } from 'vuetify';

const { t } = useI18n({ useScope: 'global' });
const { xs, smAndDown } = useDisplay();

useSeoMeta({ title: () => t('pageTitles.categories') });

const { isPending: isCurrencyPending } = useCurrencyQueryState();

const { state: categoriesState } = useCategoriesQuery();
</script>
