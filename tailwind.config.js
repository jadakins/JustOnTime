/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for flood/traffic severity
        'flood-safe': '#22c55e',
        'flood-warning': '#eab308',
        'flood-danger': '#ef4444',
        'traffic-clear': '#22c55e',
        'traffic-moderate': '#eab308',
        'traffic-heavy': '#ef4444',
      },
    },
  },
  plugins: [],
}
