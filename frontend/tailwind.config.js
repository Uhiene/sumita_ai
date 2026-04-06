/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#6B3FA0",
          yellow: "#FFD700",
          bg: "#FFF8F0",
          card: "#FFFFFF",
          border: "#FFD6E0",
          primary: "#C9B8FF",
          accent: "#D6F0FF",
          success: "#D4F5E9",
          warning: "#FFF3CC",
          error: "#FFE0E0",
          text: "#2D2D2D",
          muted: "#6B6B6B",
        },
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },
    },
  },
  plugins: [],
};
