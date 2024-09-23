import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import pluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import tsParser from '@typescript-eslint/parser'; // TypeScript parser
import tsPlugin from '@typescript-eslint/eslint-plugin'; // TypeScript ESLint plugin

export default [
  // Apply configuration to .js, .jsx, .ts, and .tsx files
  { files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'] },

  // Define global settings (browser environment)
  { languageOptions: { globals: globals.browser } },

  // Apply JS and React recommended configurations
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,

  // Explicitly specify the React version
  {
    settings: {
      react: {
        version: '18.3.1', // Set React version explicitly to 18
      },
    },
  },

  // Add TypeScript ESLint configurations
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: './',
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: pluginPrettier,
    },
    rules: {
      'react/prop-types': 'off', // Disable prop-types validation
      '@typescript-eslint/explicit-module-boundary-types': 'off', // Turn off explicit return types on functions
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ], // Allow unused variables starting with _
      'prettier/prettier': 'error', // Prettier formatting as ESLint errors
      'react/react-in-jsx-scope': 'off', // Disable React import check for React 17+
      'react/react-in-tsx-scope': 'off', // Disable React import check for React 17+
      'react/jsx-uses-react': 'off',
    },
  },

  // Disable ESLint rules that conflict with Prettier
  prettierConfig,

  // Ignore certain directories
  {
    ignores: ['node_modules/', 'dist/', 'build/'],
  },
];
