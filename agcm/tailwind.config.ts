import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        guinea: {
          red: '#DC143C',
          yellow: '#FFD700',
          green: '#228B22',
        },
        agcm: {
          900: '#0f2417',
          800: '#123524',
          700: '#19533a',
          600: '#1f6b4a',
          500: '#2e8b57',
          400: '#52a272',
          sand: '#f6eedf',
          accent: '#c44536',
          gold: '#ffd166',
        },
      },
    },
  },
  plugins: [],
};

export default config;