/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { navy: "#0F172A" },
        obsidian: "#1E293B",
        "on-surface": { DEFAULT: "#1E293B", variant: "#64748B" },
        outline: { DEFAULT: "#94A3B8", variant: "#E2E8F0" },
        signal: { indigo: "#6366F1", "indigo-light": "#818CF8", "indigo-dark": "#4F46E5", "indigo-tint": "#EEF2FF" },
        pulse: { coral: "#F43F5E" },
        sunset: { coral: "#FB7185" },
        vital: { green: "#10B981" },
        caution: { amber: "#F59E0B" },
        paper: { DEFAULT: "#F8FAFC" },
        line: { DEFAULT: "#F1F5F9" },
        surface: {
          "container-lowest": "#FFFFFF",
          "container-low": "#F4F4F2",
          container: "#EEEEEC",
          "container-high": "#E8E8E6",
          "container-highest": "#E2E3E1",
        },
        module: {
          lab: "#0E8974",
          radiology: "#6B4FDD",
          pharmacy: "#B8860B",
          nursing: "#158A72",
          billing: "#0A7A5C",
          emergency: "#FF6A3D",
        },
      },
      fontFamily: {
        display: ["'Poppins'", "sans-serif"],
        body: ["'Poppins'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "data-lg": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "data-sm": ["13px", { lineHeight: "18px", fontWeight: "500" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "700" }],
      },
      borderRadius: { hero: "20px", card: "12px", input: "8px" },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 1px 0 rgba(255,255,255,0.6) inset",
        "card-hover": "0 6px 20px rgba(15,23,42,0.08)",
        soft: "0 10px 40px -10px rgba(15,23,42,0.06)",
        glow: "0 0 20px rgba(99,102,241,0.18)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #F43F5E 100%)",
      },
      keyframes: {
        pulseGlow: { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.55 } },
      },
      animation: { pulseGlow: "pulseGlow 2.2s ease-in-out infinite" },
    },
  },
  plugins: [],
};
