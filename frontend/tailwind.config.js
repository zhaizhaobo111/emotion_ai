/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#1a0a14",
          secondary: "#231020",
          card: "#2a1525",
        },
        accent: {
          pink: "#f472b6",
          hot: "#ec4899",
          light: "#fbcfe8",
          rose: "#fda4af",
        },
        glow: {
          pink: "rgba(244, 114, 182, 0.3)",
          hot: "rgba(236, 72, 153, 0.3)",
          light: "rgba(251, 207, 232, 0.2)",
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
