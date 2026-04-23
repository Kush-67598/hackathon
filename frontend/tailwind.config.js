/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        iris: "#7C6FCD",
        lavender: "#B09EE8",
        mauve: "#C8A7D8",
        petal: "#E8D5F0",
        gold: "#C9A44A",
        warmGold: "#E8C97A",
        indigo: "#2A1F4E",
        white: "#FFFFFF",
      },
      backgroundImage: {
        "niramaya-gradient": "linear-gradient(135deg, #7C6FCD 0%, #B09EE8 40%, #C8A7D8 70%, #D4A0C0 100%)",
      },
    },
  },
  plugins: [],
};
