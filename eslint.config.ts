import pluginVue from 'eslint-plugin-vue';
import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import stylistic from '@stylistic/eslint-plugin';
import unocss from '@unocss/eslint-config/flat';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
   {
      name: 'app/files-to-lint',
      files: ['**/*.{ts,mts,tsx,vue}'],
   },
   globalIgnores([
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      'functions/**',
      './src/types/i18n-schema.d.ts',
      './src/types/typed-router.d.ts',
      './src/types/database-generated.ts'
   ]),
   ...pluginVue.configs['flat/essential'],
   vueTsConfigs.recommended,
   unocss,
   stylistic.configs.customize({
      indent: 3,
      quotes: 'single',
      arrowParens: false,
      commaDangle: 'only-multiline',
      semi: true,
      braceStyle: '1tbs',
   }),
   {
      rules: {
         '@typescript-eslint/no-unused-vars': 'warn',
         '@stylistic/max-len': [2, 100, {
            ignoreUrls: true,
            ignoreTrailingComments: true,
            ignoreStrings: true,
            ignoreRegExpLiterals: true,
            ignoreTemplateLiterals: true,
         }],
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
      languageOptions: {
         globals: { definePage: 'readonly' },
      },
   },
);
