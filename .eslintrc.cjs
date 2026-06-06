module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',       // React 17+ JSX transform — no import needed
    'plugin:react-hooks/recommended', // Enforces rules of hooks
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'src/context'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: '18.3',
    },
  },
  plugins: ['react-refresh'],
  rules: {
    // Warn on components that can't be hot-reloaded
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/prop-types': 'off', // Disabled for JS hackathon speed; enable for production
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
