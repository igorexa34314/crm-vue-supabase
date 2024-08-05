<template>
	<div>
		<div class="subtitle">
			<h4 class="text-h6 text-sm-h5 mb-3 mb-sm-7 text-subtitle">{{ $t('create') }}</h4>
		</div>

		<v-form ref="form" @submit.prevent="submitHandler">
			<LocalizedInput
				v-model="formState.title"
				:rules="validations.title"
				variant="underlined"
				:label="$t('title')"
				required />

			<LocalizedInput
				v-model.number="formState.limit"
				:rules="validations.limit"
				variant="underlined"
				type="number"
				:label="$t('limit') + ` (${userCurrency})`"
				class="mt-6"
				required />

			<v-btn color="success" type="submit" :class="$vuetify.display.xs ? 'mt-4' : 'mt-7'" :loading="loading">
				{{ $t('create') }}
				<v-icon :icon="mdiSend" class="ml-3" />
			</v-btn>
		</v-form>
	</div>
</template>

<script setup lang="ts">
import LocalizedInput from '@/components/ui/LocalizedInput.vue';
import { mdiSend } from '@mdi/js';
import { ref } from 'vue';
import { createCategory, type Category, type CategoryData } from '@/api/category';
import { useSnackbarStore } from '@/stores/snackbar';
import { useI18n } from 'vue-i18n';
import { category as validations } from '@/utils/validations';
import { useCurrencyFilter } from '@/composables/useCurrencyFilter';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { defaultCategoryLimit } from '@/constants/app';
import type { VForm } from 'vuetify/components';

const { defaultLimit = defaultCategoryLimit } = defineProps<{
	defaultLimit?: number;
}>();

const emit = defineEmits<{
	created: [category: Category];
}>();

const { t, te } = useI18n();

const cf = useCurrencyFilter();
const { showMessage } = useSnackbarStore();

const { userCurrency } = storeToRefs(useUserStore());
const form = ref<VForm | null>(null);
const loading = ref(false);

const formState = ref<CategoryData>({
	title: '',
	limit: Math.floor(cf.value(defaultLimit) / 10) * 10,
});

const submitHandler = async () => {
	const valid = (await form.value?.validate())?.valid;
	if (valid) {
		try {
			const { limit, ...data } = formState.value;
			loading.value = true;
			const category = await createCategory({
				...data,
				limit: cf.value(limit, { type: 'reverse' }),
			});
			if (category) {
				emit('created', category);
				form.value?.reset();
				formState.value.limit = Math.floor(cf.value(defaultLimit) / 100) * 100;
				showMessage(t('category_created'));
			} else {
				throw new Error('category_undefined');
			}
		} catch (e) {
			if (typeof e === 'string') {
				showMessage(te(e) ? t(e) : e.substring(0, 64), 'red-darken-3');
			} else {
				showMessage('error_create_category', 'red-darken-3');
			}
		} finally {
			loading.value = false;
		}
	}
};
</script>
