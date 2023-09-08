<template>
	<div class="birthday-picker" :style="{ 'max-width': maxWidth + 'px' }">
		<div class="birthday-picker__label mb-5 text-subtitle-1 text-primary" style="opacity: 0.75">
			<slot name="label">{{ label }}</slot>
		</div>
		<div class="birthday-picker__input d-flex align-sm-center flex-column flex-sm-row">
			<v-select
				v-for="item in datePickerDateItems"
				:key="item.type"
				v-bind="{ label: item.title, items: item.items, variant, density }"
				v-model="datePickerState[item.type as keyof typeof datePickerState]"
				class="mr-4"
				:class="`${item.type}-select order-${item.order}`" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect } from 'vue';
import { useI18n, DateTimeOptions } from 'vue-i18n';
import { VSelect } from 'vuetify/components';

const props = withDefaults(
	defineProps<{
		modelValue?: Date;
		fromYear?: string | number;
		order?: 'dd-mmm-yyyy' | 'mmm-dd-yyyy';
		density?: VSelect['density'];
		variant?: VSelect['variant'];
		label?: string;
		maxWidth?: string | number;
	}>(),
	{
		modelValue: () => new Date(),
		fromYear: new Date().getFullYear() - 100,
		order: 'dd-mmm-yyyy',
		variant: 'outlined',
		density: 'compact',
		maxWidth: 700,
	}
);

const emit = defineEmits<{
	'update:modelValue': [date: Date];
}>();

defineSlots<{
	label(): any;
}>();

const datePickerDateItems = computed(() => [
	{
		type: 'month',
		title: 'Месяц',
		items: monthsForLocales('long').map((title, i) => ({ title, value: ++i })),
		order: props.order === 'dd-mmm-yyyy' ? 2 : 1,
	},
	{
		type: 'day',
		title: 'День',
		items: Array.from({ length: 31 }, (v, i) => ++i),
		order: props.order === 'dd-mmm-yyyy' ? 1 : 2,
	},
	{
		type: 'year',
		title: 'Год',
		items: Array.from(
			{ length: new Date().getFullYear() - +props.fromYear },
			(v, i) => +props.fromYear + ++i
		).reverse(),
		order: 3,
	},
]);

const datePickerState = ref<Record<'month' | 'day' | 'year', number>>({
	month: new Date().getMonth() + 1,
	day: new Date().getDate(),
	year: new Date().getFullYear(),
});

watchEffect(() => {
	datePickerState.value = {
		month: props.modelValue.getMonth() + 1,
		day: props.modelValue.getDate(),
		year: props.modelValue.getFullYear(),
	};
});
watch(
	datePickerState,
	newVal => {
		emit('update:modelValue', new Date(Object.values(newVal).join('-')));
	},
	{ deep: true }
);

const monthsForLocales = (monthFormat: DateTimeOptions['month'] = 'long') => {
	const { d } = useI18n();
	return [...Array(12).keys()].map(m => d(new Date(Date.UTC(2022, m % 12)), { month: monthFormat }));
};
</script>
