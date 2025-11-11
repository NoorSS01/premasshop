module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'plugin:jsx-a11y/recommended',
		'prettier',
	],
	settings: {
		react: { version: 'detect' },
	},
	ignorePatterns: [
		'node_modules/',
		'dist/',
		'build/',
		'.vite/',
		'frontend/dist/',
	],
	rules: {
		'react/react-in-jsx-scope': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
	},
};


