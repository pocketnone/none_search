/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    relative: true,
    files: [
      "./views/index.ejs",
      "./views/*.{html,js,ejs}",
      "./views/includes/*.{html,js,ejs}"
    ]
  },
  theme: {
    colors: {
      transparent: 'transparent',
      white: 'white',
      black: 'black',
      'gray-10': '#f5f5f5',
      'gray-90': '#222',
      'blue-30': '#7295f6',
      'blue-40': '#557ff3',
      'blue-50': '#3969ef',
      'blue-60': '#2b55ca',
      'violet-70': '#342e42',
      'green-30': '#7bd66d',
      'green-40': '#63c853',
      'green-50': '#4cba3c',
      'green-60': '#399f29',
    },
    fontFamily: {
      'body': [
        'Inter',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji'
      ],
      'sans': [
        'Inter',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji'
      ],
    }
  },
  extend: {},
  plugins: [
    {
      tailwindcss: {},
      autoprefixer: {},
    },
  ],
}
