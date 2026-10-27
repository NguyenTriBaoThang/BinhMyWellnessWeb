import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F7F4EA',
          50: '#FDFAF4',
          100: '#F7F4EA',
          200: '#EFE9D7',
          300: '#E4DAC0',
          400: '#D7C7A2',
        },
        forest: {
          DEFAULT: '#174C3C',
          50: '#F2F7F4',
          100: '#E2EEE8',
          200: '#C4DCD1',
          300: '#9BC3B2',
          400: '#6FA58F',
          500: '#46866E',
          600: '#2A6953',
          700: '#1F5744',
          800: '#174C3C',
          900: '#113A2E',
          950: '#0A241D',
        },
        sage: {
          DEFAULT: '#E7EFE4',
          50: '#F6FAF4',
          100: '#E7EFE4',
          200: '#D2E1CC',
          300: '#B8CEAF',
          400: '#9DBA92',
          500: '#7E9F73',
          600: '#5F7C55',
        },
        gold: {
          DEFAULT: '#D6A545',
          50: '#FDF9F0',
          100: '#FAF0DB',
          200: '#F4DFB3',
          300: '#ECCA8B',
          400: '#E2B863',
          500: '#D6A545',
          600: '#BD892D',
          700: '#9B6C1E',
          800: '#7A521A',
          900: '#5F3F17',
        },
        charcoal: {
          DEFAULT: '#26352E',
          50: '#F4F6F5',
          100: '#E4E8E6',
          200: '#C7D0CB',
          300: '#A4B2AA',
          400: '#7E9187',
          500: '#5C6F66',
          600: '#43544C',
          700: '#324039',
          800: '#26352E',
          900: '#1A2520',
          950: '#0F1613',
        },
      },
      borderRadius: {
        'card': '22px',
        'card-lg': '24px',
        'pill': '9999px',
      },
      fontFamily: {
        sans: ['var(--font-be-vietnam-pro)', 'Be Vietnam Pro', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '3d-soft': '0 10px 25px -5px rgba(23, 76, 60, 0.08), 0 8px 10px -6px rgba(23, 76, 60, 0.04)',
        '3d-lift': '0 20px 35px -10px rgba(23, 76, 60, 0.16), 0 10px 15px -5px rgba(23, 76, 60, 0.08)',
        '3d-float': '0 25px 50px -12px rgba(23, 76, 60, 0.22)',
        'btn-forest': '0 6px 18px -2px rgba(23, 76, 60, 0.35)',
        'btn-gold': '0 6px 18px -2px rgba(214, 165, 69, 0.45)',
      },
      keyframes: {
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'float-subtle': 'floatSubtle 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
