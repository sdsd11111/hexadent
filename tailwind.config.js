/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#009797', // Teal del logo
        secondary: '#58595b', // Gris carbono
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        bold: '700',
        black: '900',
      },
    },
  },
  plugins: [],
}
