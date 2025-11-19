module.exports = {
  content: ["./*.{html,js}"],
  theme: { extend: {} },
  plugins: [],
  safelist: [
    "nav-active",

    // underline style
    "border-b-2",
    "border-purple-500",

    // active text/color
    "text-white",
    "font-semibold",

    // rounded style
    "rounded-full",
    "px-4",
    "py-1",

    // hover effects
    "hover:border-purple-500",
    "hover:text-white",

    // glow
    "shadow-md",
    "shadow-purple-500/30",
  ],
};
