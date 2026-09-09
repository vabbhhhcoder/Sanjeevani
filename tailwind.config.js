/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        trust: { 50:'#EEF6F5',100:'#D3E9E7',200:'#A7D3CF',300:'#6FB5AF',400:'#3E938C',500:'#1F6F69',600:'#165C57',700:'#134E4A',800:'#0D4B48',900:'#08312F' },
        comfort: { 300:'#A5B4FC',400:'#818CF8',500:'#6366F1',600:'#4F46E5' },
        alabaster: '#F9F9F8',
        obsidian: '#111816',
        risk: { low:'#10B981', mod:'#F59E0B', high:'#E11D48' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"','Inter','system-ui','sans-serif'],
        serif: ['Merriweather','Georgia','serif'],
      },
      boxShadow: { soft: '0 10px 40px -12px rgba(13,75,72,0.18)' },
      keyframes: {
        breathe: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.18)' } },
      },
      animation: { breathe: 'breathe 8s ease-in-out infinite' },
    },
  },
  plugins: [],
};
