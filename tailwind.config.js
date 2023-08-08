/** @type {import('tailwindcss').Config} */

const SEMANTIC_CLASSES = {
	// Main Colors
	'main-blue': 'var(--main-blue)',
	'secondary-blue': 'var(--secondary-blue)',

	// Font Colors
	'text-default': 'var(--text-default)',
	'text-secondary': 'var(--text-secondary)',
	'text-emphasis': 'var(--text-emphasis)',
	'text-semi-emphasis': 'var(--text-semi-emphasis)',
	'text-selected': 'var(--text-selected)',
	'text-button-link-hover': 'var(--text-button-link-hover)',
	'text-button-link-active': 'var(--text-button-link-active)',

	// Background/Border Colors
	'container-bg': 'var(--container-bg)',
	'container-bg-hover': 'var(--container-bg-hover)',
	'container-bg-selected': 'var(--container-bg-selected)',
	'container-border': 'var(--container-border)',
	'container-border-light': 'var(--container-border-light)',
	'container-border-selected': 'var(--container-border-selected)',
	'container-border-hover': 'var(--container-border-hover)',
	'button-bg-disabled': 'var(--button-bg-disabled)',
	'success-green-border': 'var(--success-green-border)',
	'success-green-bg': 'var(--success-green-bg)',
	'warning-yellow-border': 'var(--warning-yellow-border)',
	'error-red-border': 'var(--error-red-border)',
	'error-red-bg': 'var(--error-red-bg)',
};

module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic':
					'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			colors: SEMANTIC_CLASSES,
		},
	},
	plugins: [],
};
