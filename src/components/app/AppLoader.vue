<template>
	<div :class="{ 'flex inset-0 items-center justify-center pos-fixed': page }">
		<div
			class="h-[80px] w-[80px] inline-block scale-[0.7] relative md:scale-100"
			:style="cssProps">
			<div
				v-for="(p, idx) in dotsPositions"
				:key="idx"
				class="origin-[40px_40px] absolute animate-loading"
				:style="{
					animationDelay: p.delay,
				}">
				<span
					class="rounded-full bg-[--app-loader-color] h-[7px] w-[7px] block absolute -translate-x-1/2 -translate-y-1/2"
					:style="{ top: p.top, left: p.left }"></span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();

const { color, page } = defineProps<{
	page?: boolean;
	color?: string;
}>();

const cssProps = computed(() => ({
	'--app-loader-color': color || (theme.global.current.value.dark ? '#FFFFFF' : '#000000'),
}));

const dotsPositions = [
	{ top: '63px', left: '63px', delay: '-0.036s' },
	{ top: '68px', left: '56px', delay: '-0.072s' },
	{ top: '71px', left: '48px', delay: '-0.108s' },
	{ top: '72px', left: '40px', delay: '-0.144s' },
	{ top: '71px', left: '32px', delay: '-0.18s' },
	{ top: '68px', left: '24px', delay: '-0.216s' },
	{ top: '63px', left: '17px', delay: '-0.252s' },
	{ top: '56px', left: '12px', delay: '-0.288s' },
];
</script>
