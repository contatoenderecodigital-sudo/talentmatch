/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Paleta do DeuVaga (decisão de UI — ver docs/decisoes-ui.md)
        primaria: '#059669', // emerald-600
        'primaria-escura': '#047857',
      },
    },
  },
  plugins: [],
};
