import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        "surface-muted": "hsl(var(--surface-muted))",
        foreground: "hsl(var(--foreground))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        danger: "hsl(var(--danger))",
        ring: "hsl(var(--ring))"
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)"
      },
      maxWidth: {
        content: "720px"
      }
    }
  },
  plugins: []
};

export default config;
