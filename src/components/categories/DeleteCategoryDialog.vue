<template>
	<ConfirmationDialog
		v-model="confirmationDialog"
		:title="$t('delete_category_confirmation')"
		:loading="loading"
		@ok="$emit('deleteCategory')" />
</template>

<script setup lang="ts">
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue';

const { loading } = defineProps<{ loading?: boolean }>();

defineEmits<{
	deleteCategory: [];
}>();

const confirmationDialog = defineModel<boolean>();
</script>
