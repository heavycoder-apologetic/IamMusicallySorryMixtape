/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sepia: {
          50:  '#fbf3e6',
          100: '#f3e1c0',
          200: '#e8c79a',
          300: '#d9a26d',
          400: '#c07a48',
          500: '#a35a32',
          600: '#7c4123',
          700: '#5a2d18',
          800: '#3b1d10',
          900: '#231009',
        },
        bollywood: {
          rose:   '#d76283',
          maroon: '#5b1f2a',
          gold:   '#d4a24c',
          cream:  '#f4e7cf',
          teal:   '#3d6b6a',
          ink:    '#1a0f0a',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body:    ['"Cormorant Garamond"', 'serif'],
        hand:    ['"Caveat"', 'cursive'],
      },
      animation: {
        flicker:   'flicker 4.5s linear infinite',
        grain:     'grain 1.8s steps(8) infinite',
        equalizer: 'equalizer 1s ease-in-out infinite',
        lightleak: 'lightleak 9s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%,100%':  { opacity: '0.94' },
          '5%':       { opacity: '0.6'  },
          '7%':       { opacity: '0.99' },
          '40%':      { opacity: '0.85' },
          '60%':      { opacity: '1'    },
        },
        grain: {
          '0%,100%': { transform: 'translate(0,0)' },
          '10%':     { transform: 'translate(-5%,-5%)' },
          '30%':     { transform: 'translate(3%,-2%)' },
          '50%':     { transform: 'translate(-3%,4%)' },
          '70%':     { transform: 'translate(4%,2%)' },
          '90%':     { transform: 'translate(-1%,3%)' },
        },
        equalizer: {
          '0%,100%': { transform: 'scaleY(0.3)' },
          '50%':     { transform: 'scaleY(1.0)' },
        },
        lightleak: {
          '0%,100%': { opacity: '0.25', transform: 'translate(0,0) scale(1)' },
          '50%':     { opacity: '0.55', transform: 'translate(2%,-3%) scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
};
