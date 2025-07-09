/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cmu: {
          red: '#A6192E', // CMU Red
          dark: '#7D1128', // Darker shade for sidebar/hover
          light: '#F6F6F6', // Light background
          gray: '#6E6E6E', // Supporting gray
          white: '#FFFFFF',
        },
      },
    },
  },
  plugins: [],
}

