import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularHtmlParser from '@angular-eslint/template-parser';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import onlyWarn from 'eslint-plugin-only-warn';

export default tseslint.config(
  {
    ignores: [
      // Build and distribution outputs
      'dist/**',
      'build/**',
      'out/**',
      'coverage/**',

      // Angular CLI generated output
      '.angular/**',

      // Dependency directories
      'node_modules/**',

      // Environment or tooling files
      '.env',
      '*.log',
      'package-lock.json',
      'bun.lock',

      // IDE and OS files
      '.vscode/**',
      '.idea/**',
      '.DS_Store',
    ],
  },

  {
    files: ['eslint.config.mjs'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir: '.',
      },
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    extends: [eslint.configs.recommended, tseslint.configs.strictTypeChecked, tseslint.configs.stylisticTypeChecked],
    plugins: {
      'unused-imports': unusedImports,
      prettier,
      import: importPlugin,
      'only-warn': onlyWarn,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'no-await-in-loop': 'warn',
      'no-duplicate-imports': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'warn',
      'require-atomic-updates': 'warn',
      camelcase: 'warn',
      'consistent-return': 'warn',
      curly: 'error',
      'default-case': 'warn',
      'dot-notation': 'off',
      eqeqeq: 'error',
      'no-array-constructor': 'error',
      'no-lonely-if': 'warn',
      'no-magic-numbers': ['warn', { ignore: [0, 1], enforceConst: true }],
      'no-return-assign': 'warn',
      'no-var': 'error',
      'no-useless-return': 'warn',
      'prefer-const': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowNumber: true,
        },
      ],

      'prettier/prettier': 'warn',

      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'index'],
          pathGroups: [
            {
              pattern: '@angular/**',
              group: 'builtin',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
    },
  },

  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularHtmlParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      ...angularTemplate.configs.recommended.rules,
    },
  }
);
