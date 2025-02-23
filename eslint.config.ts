import pluginVue from 'eslint-plugin-vue';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
	{
		name: 'app/files-to-lint',
		files: ['**/*.{ts,mts,tsx,vue}'],
	},
	{
		name: 'app/files-to-ignore',
		ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'functions/**'],
	},
	pluginVue.configs['flat/essential'],
	vueTsConfigs.recommended,
	skipFormatting,
	{
		rules: {
			'@typescript-eslint/no-unused-vars': 'warn',
		},
	},
	{
		files: ['**/*.vue'],
		rules: {
			'vue/valid-v-slot': ['error', { allowModifiers: true }],
		},
	},
	{
		files: ['src/pages/**/*.vue'],
		rules: {
			'vue/multi-word-component-names': 'off',
		},
	},
	{
		settings: {
			'import/core-modules': ['vue-router/auto-routes'],
		},
	}
);
