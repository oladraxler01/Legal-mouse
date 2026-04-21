import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000", // Deep black
        surface: "#0A0A0A", // Dark grey for cards
        primary: "#8A2BE2", // Electric purple for accents/AI
        muted: "#A1A1AA", // Grey for secondary text
      },
      fontFamily: {
        serif: ['var(--font-crimson-pro)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
