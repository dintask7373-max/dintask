import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Strict user-requested palette
                "primary": {
                    DEFAULT: "#1e6fd9",
                    foreground: "#ffffff",
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#1e6fd9",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                },
                "background-light": "#f9fafa",
                "background-dark": "#22252a",

                // Text colors from user's HTML
                "text-main": "#111827",     // Improved contrast for blue theme
                "text-secondary": "#4b5563", // Subtle gray for secondary text

                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                // ... keeping existing shadcn vars for fallback/compatibility with other pages if needed
            },
            fontFamily: {
                display: ["Manrope", "sans-serif"],
                sans: ["Manrope", "sans-serif"], // Override default sans to Manrope
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
        },
    },
    plugins: [tailwindAnimate],
}
