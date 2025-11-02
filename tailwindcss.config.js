export default {
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        // 'noise-pattern': "url('/textures/noise.png')",
        'radial-light': 'radial-gradient(circle at 50% 0%, rgba(0,255,255,0.08), transparent 60%)',
        'radial-dark': 'radial-gradient(circle at 50% 0%, rgba(0,0,0,0.08), transparent 60%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
