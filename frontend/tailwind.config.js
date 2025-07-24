/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  safelist: ["animate-aurora"],
  theme: {
    extend: {
      keyframes: {
        aurora: {
          from: { "background-position": "80% 50%, 50% 350%" },
          to: { "background-position": "350% 80%, 350% 80%" },
        },
      },
      animation: {
        aurora: "aurora 5s ease-in-out infinite",
      },
    },
  },
};
