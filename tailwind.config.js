/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  safelist: [
    'bg-surface-container-lowest',
    'border-outline-variant/30',
    'shadow-[0_16px_32px_-12px_rgba(36,49,74,0.12)]',
    'absolute','top-0','left-0','right-0',
    'h-[2px]','bg-surface-tint','opacity-0',
    'transition-opacity','duration-300','opacity-100',
    'bg-clip-text','text-transparent',
    'bg-gradient-to-r','from-primary','to-surface-tint',
  ],
  theme: {
    extend: {
      colors: {
        'tertiary-fixed-dim': '#b4c7ee',
        'surface-container-lowest': '#ffffff',
        'secondary-fixed': '#d7e2ff',
        'surface-container': '#ebeef4',
        'on-primary': '#ffffff',
        'primary-fixed-dim': '#b9c6e6',
        'surface-container-low': '#f1f4fa',
        'secondary': '#4e5f80',
        'on-primary-container': '#8c99b7',
        'inverse-primary': '#b9c6e6',
        'tertiary': '#051c3a',
        'on-secondary': '#ffffff',
        'surface-bright': '#f7f9ff',
        'on-tertiary-fixed': '#041b3a',
        'surface-dim': '#d7dae0',
        'on-secondary-fixed': '#071b39',
        'on-secondary-container': '#4c5d7e',
        'on-primary-fixed': '#0d1b33',
        'primary-fixed': '#d7e2ff',
        'inverse-on-surface': '#eef1f7',
        'error': '#ba1a1a',
        'outline-variant': '#c5c6ce',
        'on-surface-variant': '#45474d',
        'on-tertiary': '#ffffff',
        'tertiary-fixed': '#d6e3ff',
        'background': '#f7f9ff',
        'surface-variant': '#e0e3e9',
        'surface-tint': '#525e7a',
        'secondary-fixed-dim': '#b5c7ed',
        'primary': '#0e1c34',
        'tertiary-container': '#1d3150',
        'on-secondary-fixed-variant': '#364767',
        'secondary-container': '#c6d7fe',
        'outline': '#75777e',
        'on-background': '#181c20',
        'surface': '#f7f9ff',
        'primary-container': '#24314a',
        'on-tertiary-fixed-variant': '#344768',
        'on-primary-fixed-variant': '#3a4761',
        'inverse-surface': '#2d3135',
        'surface-container-highest': '#e0e3e9',
        'on-error-container': '#93000a',
        'on-surface': '#181c20',
        'on-tertiary-container': '#8699be',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'surface-container-high': '#e5e8ee'
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      spacing: {
        base: '8px',
        'margin-mobile': '16px',
        'margin-desktop': '32px',
        gutter: '24px',
        'container-max': '1440px',
        scale: '[4, 8, 16, 24, 32, 48, 64, 80]'
      },
      fontFamily: {
        'headline-xl': ['Geist'],
        'headline-lg': ['Geist'],
        'headline-md': ['Geist'],
        'headline-sm': ['Geist'],
        'body-lg': ['Geist'],
        'body-md': ['Geist'],
        'body-sm': ['Geist'],
        'label-sm': ['Geist'],
        'code-md': ['JetBrains Mono']
      },
      fontSize: {
        'headline-xl': ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '500' }],
        'code-md': ['14px', { lineHeight: '1.6', fontWeight: '450' }]
      }
    }
  },
  plugins: []
}
