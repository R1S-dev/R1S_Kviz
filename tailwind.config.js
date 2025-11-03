
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1200px" }
    },
    extend: {
      fontFamily: {
        display: [
          'ui-sans-serif','system-ui','-apple-system','BlinkMacSystemFont',
          '"Segoe UI"','Roboto','"Helvetica Neue"','Arial'
        ]
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
        "3xl": "28px"
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.20)",
        ring: "0 0 0 3px rgba(147,197,253,0.5)"
      },
      colors: {
        ink: { DEFAULT: "#E6EAF2", subtle: "#A9B1C6", faint: "#8A93A8" },
        paper: { DEFAULT: "#0B0F1A" },
        surface: { DEFAULT: "#101725", elev: "#172036", stroke: "#1E2A44" },
        brand: {
          50:"#EDF4FF",100:"#D6E6FF",200:"#B3D0FF",300:"#8AB8FF",400:"#669EFF",
          500:"#4B8CFF",600:"#3E71FF",700:"#2E5AE6",800:"#2447B8",900:"#1C3891"
        },
        accent: {
          50:"#E8FFFB",100:"#C9FFF5",200:"#9FFAEA",300:"#73F0DD",400:"#47E4D0",
          500:"#2BD9C5",600:"#1FC4B0",700:"#18A394",800:"#167F75",900:"#125F59"
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger:  "#EF4444"
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
