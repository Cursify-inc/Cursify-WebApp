import type { Config } from "tailwindcss"

const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: "#24314A",
                    hover: "#3A4B6B",
                    light: "#5E7194",
                    dark: "#151E30"
                },
                background: {
                    DEFAULT: "#E1E4EA",
                    light: "#F0F2F5",
                    surface: "#FFFFFF"
                },
                border: {
                    DEFAULT: "#C4C9D4"
                },
                text: {
                    primary: "#0F1522",
                    secondary: "#4A5568",
                    tertiary: "#828D9F",
                    inverse: "#FFFFFF"
                },
                success: {
                    DEFAULT: "#2D8A56",
                    light: "#E6F4EA"
                },
                error: {
                    DEFAULT: "#D32F2F",
                    light: "#FDECEA"
                },
                warning: {
                    DEFAULT: "#ED8936",
                    light: "#FEF4E8"
                },
                info: {
                    DEFAULT: "#3182CE",
                    light: "#EBF8FF"
                }
            },
            boxShadow: {
                soft: "0 18px 60px rgba(15, 21, 34, 0.10)",
                glow: "0 0 80px rgba(94, 113, 148, 0.35)",
                card: "0 24px 80px rgba(21, 30, 48, 0.12)"
            },
            borderRadius: {
                "4xl": "2rem",
                "5xl": "2.5rem"
            },
            backgroundImage: {
                "hero-grid":
                    "linear-gradient(rgba(36,49,74,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(36,49,74,.08) 1px, transparent 1px)"
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-16px)" }
                },
                pulseGlow: {
                    "0%, 100%": { opacity: "0.45" },
                    "50%": { opacity: "0.85" }
                }
            },
            animation: {
                float: "float 7s ease-in-out infinite",
                pulseGlow: "pulseGlow 4s ease-in-out infinite"
            }
        }
    },
    plugins: []
}

export default config
