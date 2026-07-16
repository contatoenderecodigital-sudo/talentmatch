/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  // Evita o erro "Cannot manually set color scheme" do NativeWind no web.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta DeuVaga — azul-esverdeado (teal) premium (ver docs/decisoes-ui.md)
        primaria: '#0d9488', // teal-600 (cor de marca)
        'primaria-escura': '#0f766e', // teal-700
        'primaria-clara': '#5eead4', // teal-300
        marca: {
          50: '#effcf9',
          100: '#c9f5ec',
          200: '#96e9dc',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Acento azul (para o gradiente esverdeado→azul)
        oceano: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        tinta: '#0b2b2a', // texto escuro esverdeado (no lugar de gray-900 puro)
      },
    },
  },
  plugins: [],
};
