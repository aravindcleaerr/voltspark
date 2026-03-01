import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc5fb',
          400: '#36a9f7',
          500: '#0c8ee8',
          600: '#0070c6',
          700: '#0059a1',
          800: '#054c85',
          900: '#0a406e',
        },
        status: {
          success: '#16a34a',
          warning: '#d97706',
          danger: '#dc2626',
          info: '#0891b2',
        },
      },
    },
  },
  plugins: [],
};
export default config;
