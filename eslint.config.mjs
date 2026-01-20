// @ts-check
import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig([
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
            sourceType: 'module',
        },
        rules: {
            'comma-dangle': ['error', 'always-multiline'],
            'indent': ['error', 'tab'],
            'quotes': ['error', 'single'],
            'eol-last': ['error', 'always'],
            '@typescript-eslint/no-unsafe-enum-comparison': 'off',
        },
    },
    {
        ignores: ['node_modules', 'dist', "tests", 'eslint.config.mjs'],
    },
]);
