import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Custom burger shop colors
        "burger-red": {
          DEFAULT: "hsl(var(--burger-red))",
          dark: "hsl(var(--burger-red-dark))",
          light: "hsl(var(--burger-red-light))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          soft: "hsl(var(--gold-soft))",
        },
        ember: "hsl(var(--ember))",
        charcoal: "hsl(var(--charcoal))",
        "warm-gray": "hsl(var(--warm-gray))",
      },
      fontFamily: {
        sans: ['Rezvan', 'sans-serif'],
        diner: ['Rezvan', 'sans-serif'],
        persian: ['Rezvan', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float-down": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(10px)",
          },
        },
        "float-soft": {
          "0%, 100%": {
            transform: "translateY(0) rotate(0deg)",
          },
          "50%": {
            transform: "translateY(-18px) rotate(3deg)",
          },
        },
        "pulse-glow": {
          "0%, 100%": {
            "box-shadow": "0 0 0 0 hsl(var(--primary) / 0.5)",
          },
          "50%": {
            "box-shadow": "0 0 0 18px hsl(var(--primary) / 0)",
          },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "blob": {
          "0%, 100%": {
            "border-radius": "42% 58% 63% 37% / 41% 44% 56% 59%",
            transform: "translate(0, 0) rotate(0deg)",
          },
          "33%": {
            "border-radius": "67% 33% 47% 53% / 37% 62% 38% 63%",
            transform: "translate(20px, -16px) rotate(120deg)",
          },
          "66%": {
            "border-radius": "38% 62% 56% 44% / 63% 37% 63% 37%",
            transform: "translate(-16px, 12px) rotate(240deg)",
          },
        },
        "marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float-down": "float-down 2s ease-in-out infinite",
        "float-soft": "float-soft 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-out infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        "blob": "blob 18s ease-in-out infinite",
        "marquee": "marquee 32s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
