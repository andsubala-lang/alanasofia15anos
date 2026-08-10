import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidade Alana Sofia — preto + prata elegante (sem dourado)
        onyx: "#0B0C10",       // fundo base
        graphite: "#1C1F26",   // superfícies / cards
        slateline: "#2E323C",  // divisores, bordas
        steel: "#8A93A3",      // texto secundário / cinza-aço
        platinum: "#E4E7EC",   // texto de destaque / prata claro
        silver: {
          DEFAULT: "#C7CCD6",
          bright: "#F1F3F6",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "shimmer": "linear-gradient(110deg, #8A93A3 8%, #F1F3F6 18%, #8A93A3 33%)",
        "app-gradient": "radial-gradient(circle at 50% 0%, #1C1F26 0%, #0B0C10 60%)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
