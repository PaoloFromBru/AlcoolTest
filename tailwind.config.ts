import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#f59e0b", // amber-500
          dark: "#b45309",
        }
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    },
  },
  plugins: [],
} satisfies Config;
