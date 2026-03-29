const path = require('path');

const { hairlineWidth, platformSelect } = require('nativewind/theme');

const jiti = require('jiti')(path.resolve(process.cwd(), 'tailwind.config.js'));

const { socialPalette } = jiti('./lib/pallate.ts');

  /** @type {import('tailwindcss').Config} */
  module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
        fontFamily: {
          cabinet: ["SpaceGrotesk_700Bold"],
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
          social: {
            bg: socialPalette.bg,
            accent: socialPalette.accent,
            'accent-end': socialPalette.accentEnd,
            slate: {
              500: socialPalette.slate500,
              600: socialPalette.slate600,
            },
            'card-from': socialPalette.cardFrom,
            'accent-faint': socialPalette.accentFaint,
          },
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
