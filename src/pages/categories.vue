<template>
	<div>
		<div class="title mb-7">
			<h3 class="text-h5 text-sm-h4 mt-2 mt-sm-4 ml-2 text-title">{{ t('pageTitles.categories') }}</h3>
		</div>

		<section class="mt-sm-10 mt-7">
			<app-loader v-if="isPending || isCurrencyLoading" page />

			<template v-else>
				<Suspense>
					<v-row :class="xs ? 'px-2' : 'px-4'">
						<v-col cols="6" md="6" sm="12" xs="12" class="create-category v-col-xs-12">
							<CreateCategory
								:default-limit="100"
								@created="addNewCategory"
								:class="{ 'pr-6': !smAndDown, 'px-3': smAndDown && !xs }" />
						</v-col>

						<v-col cols="6" md="6" sm="12" xs="12" class="edit-category v-col-xs-12">
							<EditCategory
								v-if="categories?.length"
								v-bind="{ categories, defaultLimit }"
								@updated="handleUpdatedCategory"
								@deleted="handleDeletedCategory"
								:class="{ 'pl-6': !smAndDown, 'px-3': smAndDown && !xs }"
								class="mt-5 mt-sm-7 mt-md-0" />
						</v-col>
					</v-row>
				</Suspense>
			</template>
		</section>
	</div>
</template>

<script setup lang="ts">
import CreateCategory from '@/components/categories/CreateCategory.vue';
import { inject, watch, defineAsyncComponent } from 'vue';
import { useHead } from '@unhead/vue';
import { type Category } from '@/api/category';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';
import { DEFAULT_CATEGORY_LIMIT as defaultLimit } from '@/global-vars';
import { currencyKey } from '@/injection-keys';
import { useFetchCategories } from '@/composables/queries/categories';

// Page title: Categories
useHead({ title: 'pageTitles.categories' });

const EditCategory = defineAsyncComponent(() => import('@/components/categories/EditCategory.vue'));

const { t } = useI18n({ useScope: 'global' });
const { isLoading: isCurrencyLoading } = inject(currencyKey)!;
const { smAndDown, xs } = useDisplay();

const { data: categories, isPending } = useFetchCategories();

const addNewCategory = (cat: Category) => {
	categories.value = [cat, ...categories.value];
};
const handleUpdatedCategory = ({ id, ...catData }: Category) => {
	categories.value = categories.value.map(cat => (cat.id === id ? { id, ...catData } : cat));
};
const handleDeletedCategory = (categoryId: Category['id']) => {
	categories.value = categories.value.filter(cat => cat.id !== categoryId);
};
</script>
