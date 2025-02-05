module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: ['prettier'],
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['*.d.ts', '*.test.ts', '*.js', 'cdk.out/', 'dist/', 'node_modules/', 'bp_modules/'],
  plugins: [
    'eslint-plugin-import',
    '@typescript-eslint',
    'unused-imports',
    'eslint-plugin-prettier',
  ],
  rules: {
    'no-console': 'off',
    complexity: ['off'],
    'no-cond-assign': 'error',
    'no-const-assign': 'error',
    'no-debugger': 'error',
    'no-sparse-arrays': 'error',
    'no-unreachable': 'error',
    'max-lines-per-function': [
      'error',
      {
        max: 120,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'default-case': 'error',
    'default-case-last': 'error',
    'max-depth': 'error',
    'no-eval': 'error',
    'no-return-assign': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      },
    ],
    '@typescript-eslint/prefer-namespace-keyword': 'error',
    '@typescript-eslint/quotes': [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    "@typescript-eslint/no-misused-promises": "error",
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/type-annotation-spacing': 'error',
    'brace-style': ['error', '1tbs'],
    curly: 'error',
    'eol-last': 'error',
    eqeqeq: ['error', 'smart'],
    '@typescript-eslint/no-shadow': 'off',
    'import/order': [
      'warn',
      {
        groups: [['builtin', 'external'], 'parent', 'index', 'sibling'],
        // TODO: Eventually enable this in the future for consistency
        // 'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'linebreak-style': ['error', 'unix'],
    'no-duplicate-imports': 'error',
    'no-trailing-spaces': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'warn',
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'off',
    'unused-imports/no-unused-vars': 'off'
  },
  parser: '@typescript-eslint/parser',
}
