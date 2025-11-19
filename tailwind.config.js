module.exports = {
  content: ["./*.{html,js}"], // Scans all HTML and JS files in the root
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Keep nav active styles
    "border-purple-500",
    "border-b-2",
    "text-white",
    "font-semibold",

    // Keep rounded styles if applied dynamically
    "rounded-full",
    "rounded-lg",

    // Keep hover border / gradient classes
    "hover:border-purple-500",
    "from-purple-600",
    "to-orange-500",
  ],
};
