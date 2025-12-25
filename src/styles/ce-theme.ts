/**
 * CE Brand Design Tokens
 * Based on CE Brand Guideline 2022
 */

export const ceTheme = {
  // Primary brand color
  colors: {
    primary: {
      DEFAULT: '#676E9F',
      rgb: '103, 110, 159',
      hsl: '234, 24%, 51%',
    },
    // Neutral scale (CE guideline tints)
    neutral: {
      // CE 20% / 40% / 60% / 80%
      20: '#DEE0E9',
      40: '#BCC1D3',
      60: '#99A1BE',
      80: '#7982A8',
    },
    // Darker mixes from guideline page (+20K / +40K)
    mix: {
      20: '#565D85',
      40: '#434A6B',
    },
    // Secondary accent colors (for charts, infographics, highlights)
    accent: {
      teal: '#5BA3A0',
      coral: '#E07B67',
      gold: '#D4A84B',
      sage: '#7BA387',
      slate: '#6B7B8C',
    },
    // UI colors
    white: '#FFFFFF',
    black: '#151620',
    gray: {
      100: '#F7F7F8',
      200: '#E5E5E7',
      300: '#C4C4C8',
      400: '#9E9EA5',
      500: '#6B6B73',
      600: '#4A4A52',
      700: '#2E2E35',
      800: '#1E1E24',
      900: '#151620',
    },
    // Semantic colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Typography - Lato font family
  typography: {
    fontFamily: {
      primary: "'Lato', sans-serif",
      fallback: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fontWeight: {
      light: 300, // Body text
      regular: 400, // Subtitles
      medium: 500, // Subtitles emphasis
      bold: 700, // Headings
      heavy: 900, // Strong headings
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem', // 60px
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing scale
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
    '4xl': '6rem', // 96px
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem', // 4px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Animation durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
} as const;

export type CETheme = typeof ceTheme;
