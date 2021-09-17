const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')
const config = require('@apideck/components/tailwind-config')

module.exports = config({
  purge: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@apideck/file-picker/dist/*.js'
  ],
  darkMode: false,
  theme: {
    extend: {
      fontFamily: {
        'basier-circle': ['Basier Circle', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        gray: colors.blueGray
      }
    }
  },
  variants: {},
  plugins: []
})
