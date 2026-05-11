import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f9ff",
          100: "#e6f0ff",
          200: "#bed8ff",
          300: "#8bb6ff",
          400: "#528cff",
          500: "#2b67f6",
          600: "#184fda",
          700: "#163faa",
          800: "#193988",
          900: "#1a326f"
        },
        accent: {
          500: "#ff6a00",
          600: "#db5700"
        }
      },
      boxShadow: {
        soft: "0 14px 30px -18px rgba(21, 46, 117, 0.45)"
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(29, 78, 216, 0.12) 1px, transparent 0)"
      }
    },
  },
  plugins: [],
};

export default config;
