import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#070B14",
        panel: "#0D1424",
        border: "#1C2940",
        accent: "#6EA8FF",
        muted: "#96A2BC"
      }
    }
  },
  plugins: []
};

export default config;
