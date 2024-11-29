import vue from 'eslint-plugin-vue'
import stylistic from '@stylistic/eslint-plugin'
import ts from 'typescript-eslint'
import vitest from '@vitest/eslint-plugin'
import vueParser from 'vue-eslint-parser'

export default [
    {
        files: ['**/*.{ts,tsx,vue}'],
    },
    {
        ignores: ['dist/**', 'dist-ssr/**', 'coverage/**'],
    },
    ...vue.configs['flat/essential'],
    ...ts.configs.strictTypeChecked,
    ...ts.configs.stylisticTypeChecked,
    stylistic.configs.customize({
        indent: 4,
        quotes: 'single',
    }),
    {
        ...vitest.configs.recommended,
        files: ['lib/**/__tests__/*'],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                extraFileExtensions: ['.vue'],
            },
        },
    },
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: ts.parser,
                extraFileExtensions: ['.vue'],
            },
        },
        rules: {
            'vue/script-indent': ['error', 4, {
                baseIndent: 1,
            }],
            '@stylistic/indent': 'off',
        },
    },
    {
        files: ['**/*.js'],
        ...ts.configs.disableTypeChecked,
    },
    {
        files: ['**/*.{ts,tsx,vue}'],
        rules: {
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-redundant-type-constituents': 'off',
            '@typescript-eslint/unbound-method': 'off',
            '@typescript-eslint/no-unnecessary-condition': ['error', {
                allowConstantLoopConditions: true,
                checkTypePredicates: true,
            }],
        },
    },
]
