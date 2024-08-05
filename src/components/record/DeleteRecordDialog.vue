<template>
	<ConfirmationDialog
		v-model="confirmationDialog"
		:title="t('delete_record_confirmation')"
		@on-submit="emit('deleteRecord')" />
</template>

<script setup lang="ts">
import ConfirmationDialog from '@/components/ui/ConfirmationDialog.vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits<{
	deleteRecord: [];
}>();

const confirmationDialog = defineModel<boolean>();

const { t } = useI18n();
</script>
