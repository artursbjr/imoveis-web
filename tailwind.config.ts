import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#12160F",
          900: "#1A2016",
          800: "#232B1D",
          700: "#333F2A",
        },
        paper: {
          50: "#FAFAF7",
          100: "#F3F2EC",
          200: "#E6E4D9",
        },
        olive: {
          500: "#5A7346",
          600: "#3F5533",
          700: "#324226",
        },
        amber: {
          500: "#C98A2C",
        },
        brick: {
          500: "#AE4B36",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
