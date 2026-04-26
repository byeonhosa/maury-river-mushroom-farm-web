import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          mahogany: "#642d10",
          burnt: "#8b4324",
          ebony: "#59644a",
          ivory: "#f1cd94",
          cream: "#fff8ec",
          parchment: "#f8e5c4",
          wheat: "#f6ddb3",
          linen: "#fffdf8"
        }
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        subheading: ["var(--font-subheading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(100, 45, 16, 0.14)",
        card: "0 12px 32px rgba(100, 45, 16, 0.11)",
        lifted: "0 22px 48px rgba(100, 45, 16, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
