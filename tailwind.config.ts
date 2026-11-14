import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          "100": "#FFF1E6",
          "500": "#FF7000",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        dark: {
          "100": "#000000",
          "200": "#0F1117",
          "300": "#151821",
          "400": "#212734",
          "500": "#101012",
        },
        light: {
          "400": "#858EAD",
          "500": "#7B8EC8",
          "700": "#DCE3F1",
          "800": "#F4F6F8",
          "850": "#FDFDFD",
          "900": "#FFFFFF",
        },
        ink: {
          "950": "#070708",
          "900": "#0E0E10",
          "850": "#121214",
          "800": "#1D1D20",
          "700": "#27272A",
          "600": "#3A3A3F",
        },
        fg: {
          DEFAULT: "#F5F5F4",
          muted: "#A3A3A3",
          faint: "#8A8A8A",
        },
        gold: {
          DEFAULT: "#F5C451",
          light: "#FFD97A",
          deep: "#E9B13C",
          ink: "#1A1306",
        },
        low: "#FF9F43",
        out: "#FF5A6A",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      boxShadow: {
        "light-100":
          "0px 12px 20px 0px rgba(184, 184, 184, 0.03), 0px 6px 12px 0px rgba(184, 184, 184, 0.02), 0px 2px 4px 0px rgba(184, 184, 184, 0.03)",
        "light-200": "10px 10px 20px 0px rgba(218, 213, 213, 0.10)",
        "light-300": "-10px 10px 20px 0px rgba(218, 213, 213, 0.10)",
        "dark-100": "0px 2px 10px 0px rgba(46, 52, 56, 0.10)",
        "dark-200": "2px 0px 20px 0px rgba(39, 36, 36, 0.04)",
        raised:
          "inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 8px 18px rgba(0, 0, 0, 0.6)",
        well: "inset 0 2px 6px rgba(0, 0, 0, 0.7)",
        "gold-glow":
          "inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 8px 20px rgba(245, 196, 81, 0.35)",
        float:
          "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 30px rgba(0, 0, 0, 0.8)",
      },
      screens: {
        xs: "420px",
      },
      fontFamily: {
        inter: ["var(--font-inter)"],
        "space-grotesk": ["var(--font-space-grotesk)"],
        archivo: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2": "8px",
        "1.5": "6px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        auth: 'url("/images/auth-bg.jpg")',
        raised: "linear-gradient(180deg, #232326, #131315)",
        tile: "linear-gradient(180deg, #1D1D20, #121214)",
        "gold-btn": "linear-gradient(180deg, #FFD97A, #E9B13C)",
        "gold-chip": "linear-gradient(180deg, #2A2418, #17140E)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
