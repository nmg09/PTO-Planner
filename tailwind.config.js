/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f1f5f9",
        brand: "#0ea5e9",
        mint: "#10b981",
        amber: "#f59e0b",
        rose: "#ef4444"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(2, 6, 23, 0.08)"
      }
    }
  },
  plugins: []
};
