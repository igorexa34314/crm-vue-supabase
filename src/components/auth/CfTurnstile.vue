<script setup lang="ts">
/// <reference types="@types/cloudflare-turnstile" />
import { useScriptCloudflareTurnstile } from '@/composables/turnstile';
import { ref, onBeforeUnmount, useTemplateRef } from 'vue';

const {
	tag = 'div',
	options = {},
	resetInterval = 1000 * 250,
} = defineProps<{
	tag?: keyof HTMLElementTagNameMap;
	options?: Omit<Partial<Turnstile.RenderParameters>, 'callback'>;
	resetInterval?: number;
}>();

const token = defineModel<string>();

const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const elRef = useTemplateRef<HTMLElement>('el');
const unmountStarted = ref(false);
let id: string | undefined | null = undefined;
let interval: ReturnType<typeof setInterval>;

const { onLoaded } = useScriptCloudflareTurnstile();

let _reset: Turnstile.Turnstile['reset'];
let remove: Turnstile.Turnstile['remove'];

const reset = () => {
	if (id) {
		_reset(id);
	}
};

const unmount = () => {
	unmountStarted.value = true;
	clearInterval(interval);

	if (id) {
		remove(id);
	}
};

onLoaded(async ({ render, reset: resetFn, remove: removeFn }) => {
	if (!elRef.value) {
		return;
	}
	_reset = resetFn;
	remove = removeFn;
	id = render(elRef.value, {
		sitekey: siteKey,
		callback: (_token: string) => (token.value = _token),
		...options,
	});
	interval = setInterval(reset, resetInterval);

	if (unmountStarted.value) {
		unmount();
	}
});

onBeforeUnmount(unmount);

defineExpose({ reset });
</script>

<template>
	<component :is="tag" ref="el" />
</template>
