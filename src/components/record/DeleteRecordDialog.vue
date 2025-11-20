<template>
	<ConfirmationDialog
		v-model="confirmationDialog"
		:title="$t('delete_record_confirmation')"
		:loading="loading"
		@submit="$emit('deleteRecord')" />
</template>

<script setup lang="ts">
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue';

const { loading } = defineProps<{ loading?: boolean }>();

defineEmits<{
	deleteRecord: [];
}>();

const confirmationDialog = defineModel<boolean>();
</script>
