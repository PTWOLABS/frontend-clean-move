import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/shared/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        "border-subtle": "hsl(var(--border-subtle))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          active: "hsl(var(--primary-active))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "hsl(var(--secondary-hover))",
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
          soft: "hsl(var(--accent-soft))",
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
          background: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          active: "hsl(var(--sidebar-active))",
          "active-foreground": "hsl(var(--sidebar-active-foreground))",
          hover: "hsl(var(--sidebar-hover))",
          border: "hsl(var(--sidebar-border))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          soft: "hsl(var(--success-soft))",
          "soft-foreground": "hsl(var(--success-soft-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          soft: "hsl(var(--warning-soft))",
          "soft-foreground": "hsl(var(--warning-soft-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
          soft: "hsl(var(--danger-soft))",
          "soft-foreground": "hsl(var(--danger-soft-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          soft: "hsl(var(--info-soft))",
          "soft-foreground": "hsl(var(--info-soft-foreground))",
        },
        midnight: "#0b0f19",
        panel: "#141b24",
        "panel-elevated": "#192333",
        "panel-muted": "#1d2734",
        "electric-blue": "#2563eb",
        cyan: "#06b6d4",
      },
      fontFamily: {
        sans: ["var(--font-clean-sans)"],
        display: ["var(--font-clean-display)"],
        mono: ["var(--font-clean-mono)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "4px",
        xl: "16px",
        "2xl": "24px",
        button: "12px",
        input: "12px",
        card: "16px",
        modal: "24px",
        "sidebar-item": "12px",
        badge: "999px",
        "calendar-event": "12px",
      },
      boxShadow: {
        xs: "var(--shadow-token-xs)",
        sm: "var(--shadow-token-sm)",
        md: "var(--shadow-token-md)",
        lg: "var(--shadow-token-lg)",
        card: "var(--shadow-token-card)",
        modal: "var(--shadow-token-modal)",
        sidebar: "var(--shadow-token-sidebar)",
        focus: "var(--shadow-token-focus)",
        "primary-glow": "var(--shadow-token-primary-glow)",
        "step-glow": "var(--shadow-token-step-glow)",
      },
      spacing: {
        "page-mobile": "24px",
        "page-tablet": "24px",
        "page-desktop": "24px",
        "section-compact": "64px",
        "section-default": "96px",
        "section-large": "128px",
        sidebar: "280px",
        "sidebar-collapsed": "84px",
        topbar: "64px",
        control: "44px",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        DEFAULT: "var(--duration-default)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        clean: "var(--ease-clean-default)",
        "clean-in-out": "var(--ease-clean-in-out-value)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
