
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#E8F5E9", // เขียวอ่อน
          DEFAULT: "#81C784", // เขียวหลัก
          dark: "#388E3C", // เขียวเข้ม
        },
        secondary: "#FFFFFF", // ขาว
      },
    },
  },
  plugins: [],
};
