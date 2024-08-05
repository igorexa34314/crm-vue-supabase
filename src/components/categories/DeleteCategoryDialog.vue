<template>
	<ConfirmationDialog
		v-model="confirmationDialog"
		:title="t('delete_category_confirmation')"
		@on-submit="emit('deleteCategory')" />
</template>

<script setup lang="ts">
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
	deleteCategory: [];
}>();

const confirmationDialog = defineModel<boolean>();

const { t } = useI18n();
</script>
