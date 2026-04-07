/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        candyPink: "#FADADD",
        mint: "#D9F7E8",
        sky: "#D9EEFF",
        peach: "#FFE5CF",
      },
      boxShadow: {
        soft: "0 12px 24px rgba(231, 170, 195, 0.25)",
      },
    },
  },
  plugins: [],
};
