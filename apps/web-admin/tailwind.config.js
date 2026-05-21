const config = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        adminInk: '#10212b',
        adminTeal: '#0f4c5c',
        adminBlue: '#22577a',
        adminSand: '#f6f1e8',
        adminAccent: '#c85c2a',
      },
      boxShadow: {
        card: '0 18px 40px -26px rgba(13, 34, 46, 0.45)',
      },
      fontFamily: {
        heading: ['"Sora"', '"Avenir Next"', 'sans-serif'],
        body: ['"Manrope"', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
