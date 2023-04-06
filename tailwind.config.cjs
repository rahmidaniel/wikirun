/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  darkMode: ['class','[data-theme="dark"]'],

  plugins: [require("@tailwindcss/typography"), require("daisyui")],
}

