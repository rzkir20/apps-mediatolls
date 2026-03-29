const { hairlineWidth, platformSelect } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        fontFamily: {
          /** Cabinet Grotesk → Space Grotesk (Expo Google Fonts) */
          cabinet: ["SpaceGrotesk_700Bold"],
          /** Satoshi → Inter */
          sans: ["Inter_500Medium"],
          "sans-bold": ["Inter_700Bold"],
        },
        colors: {
          brand: {
            DEFAULT: withOpacity('brand'),
            end: withOpacity('brand-end'),
          },
          welcome: withOpacity('welcome'),
          'brand-highlight': withOpacity('brand-highlight'),
        },
        borderWidth: {
          hairline: hairlineWidth(),
        },
      },
    },
    plugins: [],
  }
  
  function withOpacity(variableName) {
    return ({ opacityValue }) => {
      if (opacityValue !== undefined) {
        return platformSelect({
          ios: `rgb(var(--${variableName}) / ${opacityValue})`,
          android: `rgb(var(--android-${variableName}) / ${opacityValue})`,
        });
      }
      return platformSelect({
        ios: `rgb(var(--${variableName}))`,
        android: `rgb(var(--android-${variableName}))`,
      });
    };
  }