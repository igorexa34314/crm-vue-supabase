<template>
	<div :class="{ '_page': page, '_screen': screen }" class="app-loader">
		<div v-for="i in 8" :key="i" :style="cssProps"></div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();

const props = withDefaults(defineProps<{
	page?: boolean;
	screen?: boolean;
	color?: string;
}>(), {
	screen: false,
	page: false,
});

const cssProps = computed(() => ({
	'--app-loader-color': props.color || (theme.global.current.value.dark ? '#FFFFFF' : '#000000')
}))
</script>

<style lang="scss" scoped>
.app-loader {
	display: inline-block;
	position: relative;
	width: 80px;
	height: 80px;
	@media(max-width:960px) {
		transform: scale(0.7);
		&._screen {
			transform: none;
		}
	}
	&._page {
		left: 50%;
		transform: translate(-50%);
		@media(max-width:960px) {
			transform: translate(-50%) scale(0.7);
		}
	}
	&._screen {
		position: absolute;
		top: 50%;
		left: 50%;
		&::before {
			content: "";
			pointer-events: none;
			position: fixed;
			display: block;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			z-index: 100;
			background-color: rgba($color: #FFFFFF, $alpha: .35);
		}

	}
	& div {
		animation: loading 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
		transform-origin: 40px 40px;
		&:after {
			content: " ";
			display: block;
			position: absolute;
			width: 7px;
			height: 7px;
			border-radius: 50%;
			background: var(--app-loader-color);
			margin: -4px 0 0 -4px;
		}
		&:nth-child(1) {
			animation-delay: -0.036s;
			&:after {
				top: 63px;
				left: 63px;
			}
		}
		&:nth-child(2) {
			animation-delay: -0.072s;
			&:after {
				top: 68px;
				left: 56px;
			}
		}
		&:nth-child(3) {
			animation-delay: -0.108s;
			&:after {
				top: 71px;
				left: 48px;
			}
		}
		&:nth-child(4) {
			animation-delay: -0.144s;
			&:after {
				top: 72px;
				left: 40px;
			}
		}
		&:nth-child(5) {
			animation-delay: -0.18s;
			&:after {
				top: 71px;
				left: 32px;
			}
		}
		&:nth-child(6) {
			animation-delay: -0.216s;
			&:after {
				top: 68px;
				left: 24px;
			}
		}
		&:nth-child(7) {
			animation-delay: -0.252s;
			&:after {
				top: 63px;
				left: 17px;
			}
		}
		&:nth-child(8) {
			animation-delay: -0.288s;
			&:after {
				top: 56px;
				left: 12px;
			}
		}
	}
}
@keyframes loading {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>