import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0d6efd', // Professional Blue
        'primary-dark': '#0a58ca',
        'background': '#f8f9fa',
        'surface': '#ffffff',
        'text-primary': '#212529',
        'text-secondary': '#6c757d',
        'border': '#dee2e6',
        'success': '#198754',
        'error': '#dc3545',
        'warning': '#ffc107',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        'container': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')({
      className: 'prose-eulerfold',
      css: {
        '--tw-prose-body': '#343a40',
        '--tw-prose-headings': '#212529',
        '--tw-prose-lead': '#495057',
        '--tw-prose-links': '#0d6efd',
        '--tw-prose-bold': '#212529',
        '--tw-prose-counters': '#6c757d',
        '--tw-prose-bullets': '#6c757d',
        '--tw-prose-hr': '#dee2e6',
        '--tw-prose-quotes': '#212529',
        '--tw-prose-quote-borders': '#dee2e6',
        '--tw-prose-captions': '#6c757d',
        '--tw-prose-code': '#d63384',
        '--tw-prose-pre-code': '#e9ecef',
        '--tw-prose-pre-bg': '#f8f9fa',
        '--tw-prose-th-borders': '#dee2e6',
        '--tw-prose-td-borders': '#e9ecef',
        
        h1: {
          fontWeight: '700',
        },
        h2: {
          fontWeight: '700',
        },
        h3: {
          fontWeight: '600',
        },
        a: {
          textDecoration: 'none',
          transition: 'opacity 0.2s ease-in-out',
          '&:hover': {
            opacity: '0.8',
          },
        },
      },
    }),
  ],
};

export default config;