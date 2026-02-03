# ELIDZ-STP Brand Colors

This document defines the exact brand colors extracted from the official East London IDZ logo.

## Primary Brand Colors

### Blue (Primary)
- **HEX**: `#002147`
- **RGB**: `0, 33, 71`
- **Usage**: Used for "east london" text in the logo
- **Theme Variable**: `primary`, `blue`
- **CSS Variable**: `--primary`, `--blue`

### Orange (Secondary/Accent)
- **HEX**: `#FF6600`
- **RGB**: `255, 102, 0`
- **Usage**: Used for "idz" text and "SCIENCE & TECHNOLOGY PARK" text in the logo
- **Theme Variable**: `secondary`, `accent`, `orange`
- **CSS Variable**: `--secondary`, `--accent`, `--orange`

## Gradient Colors

For LinearGradient headers, a slightly lighter blue is used:
- **HEX**: `#003366`
- **RGB**: `0, 51, 102`
- **Usage**: Gradient end color for headers (from `#002147` to `#003366`)

## Dark Mode Variants

### Blue (Dark Mode)
- **HEX**: `#001A36`
- **RGB**: `0, 26, 54`
- **Usage**: Darker variant for dark mode

### Orange (Dark Mode)
- **HEX**: `#CC5200`
- **RGB**: `204, 82, 0`
- **Usage**: Darker variant for dark mode

## Implementation

All brand colors are defined in:
- `mobile/src/theme/colors.ts` - TypeScript theme definitions
- `mobile/src/theme/global.css` - CSS variables for Tailwind

These exact colors must be used consistently across all components and pages to maintain brand identity.

