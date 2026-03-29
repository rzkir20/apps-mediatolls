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
          border: withOpacity('border'),
          input: withOpacity('input'),
          ring: withOpacity('ring'),
          background: withOpacity('background'),
          foreground: withOpacity('foreground'),
          primary: {
            DEFAULT: withOpacity('primary'),
            foreground: withOpacity('primary-foreground'),
          },
          secondary: {
            DEFAULT: withOpacity('secondary'),
            foreground: withOpacity('secondary-foreground'),
          },
          destructive: {
            DEFAULT: withOpacity('destructive'),
            foreground: withOpacity('destructive-foreground'),
          },
          muted: {
            DEFAULT: withOpacity('muted'),
            foreground: withOpacity('muted-foreground'),
          },
          accent: {
            DEFAULT: withOpacity('accent'),
            foreground: withOpacity('accent-foreground'),
          },
          popover: {
            DEFAULT: withOpacity('popover'),
            foreground: withOpacity('popover-foreground'),
          },
          card: {
            DEFAULT: withOpacity('card'),
            foreground: withOpacity('card-foreground'),
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