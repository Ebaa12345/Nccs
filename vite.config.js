/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "fade-in":  "fadeIn 0.25s ease",
        "slide-up": "slideUp 0.3s ease",
        "slide-in": "slideIn 0.25s ease",
        "spin-slow": "spin 0.8s linear infinite",
      },
      keyframes: {
        fadeIn:  {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};