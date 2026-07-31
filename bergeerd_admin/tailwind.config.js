/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "hsl(0 73% 41%)",
          dark: "hsl(0 73% 35%)",
          light: "hsl(0 65% 55%)",
          hero: "#d2080b",
        },
        charcoal: "hsl(0 0% 15%)",
        "warm-gray": "hsl(0 0% 25%)",
      },
      fontFamily: {
        sans: ["Rezvan", "sans-serif"],
      },
      boxShadow: {
        menu: "0 4px 20px -2px hsl(0 73% 41% / 0.12)",
        card: "0 2px 10px -1px hsl(0 0% 0% / 0.08)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
