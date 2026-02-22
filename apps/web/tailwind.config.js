const config = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surf: '#f2f7f4',
        wave: '#0f4c5c',
        accent: '#ff7d00',
        calm: '#4d908e',
      },
      boxShadow: {
        card: '0 14px 40px -24px rgba(10, 34, 44, 0.55)',
      },
      fontFamily: {
        heading: ['"Sora"', '"Avenir Next"', 'sans-serif'],
        body: ['"Manrope"', '"Segoe UI"', 'sans-serif'],
      },
      keyframes: {
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        riseIn: 'riseIn 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
