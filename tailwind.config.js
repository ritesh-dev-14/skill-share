/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f5f3",
          100: "#ecffc0",
          200: "#ddff88",
          300: "#d2ff62",
          400: "#c8ff3d",
          500: "#c8ff3d",
          600: "#c8ff3d",
          700: "#a9d927",
          800: "#7eaa12",
          900: "#4e690b",
        },
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
