# Brand Colors — The Maury River Mushroom Farm

Source: `MRMF_Brand Guide_CMYK.pdf`, Brand Guide by Maycee Dryden.

## Color Palette

| Role | Color Name | HEX | RGB | CMYK |
|---|---|---:|---:|---:|
| Primary | Mahogany Brown | `#642d10` | `100, 45, 16` | `36.81, 79.3, 96.26, 50.19` |
| Primary | Ivory Orange | `#f1cd94` | `241, 205, 148` | `4.7, 18.72, 46.19, 0` |
| Secondary | Burnt Orange | `#8b4324` | `139, 67, 36` | `30.54, 77.78, 95.39, 28.56` |
| Secondary | Ebony Green | `#59644a` | `89, 100, 74` | `62.19, 44.16, 72.54, 28.14` |

## Usage Rules from the Brand Guide

### Approved contrast pairings

- Use **Ivory Orange** text on backgrounds that are:
  - **Burnt Orange**
  - **Mahogany Brown**
  - **Ebony Green**
- Use **Mahogany Brown** text on an **Ivory Orange** background.

### Prohibited contrast pairings

- Do **not** pair **Burnt Orange**, **Mahogany Brown**, or **Ebony Green** with any text color other than **Ivory Orange**.
- Do **not** use any text color other than **Mahogany Brown** on an **Ivory Orange** background.

## Recommended CSS Variables

```css
:root {
  --color-mahogany-brown: #642d10;
  --color-ivory-orange: #f1cd94;
  --color-burnt-orange: #8b4324;
  --color-ebony-green: #59644a;
}
```

## Recommended Tailwind Theme Tokens

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          mahogany: "#642d10",
          ivory: "#f1cd94",
          burnt: "#8b4324",
          ebony: "#59644a",
        },
      },
    },
  },
};
```

## Implementation Notes for Codex

- Use **Mahogany Brown** as the main brand anchor color.
- Use **Ivory Orange** for warm backgrounds, highlight panels, buttons on dark backgrounds, and text on dark brand colors.
- Use **Burnt Orange** as a secondary call-to-action or accent color.
- Use **Ebony Green** for natural/earthy accents, navigation treatments, badges, and supporting panels.
- Verify all text/background combinations for WCAG contrast before launch. Where the strict brand pairings create accessibility issues at small text sizes, prefer larger text, heavier weight, or adjusted layout rather than inventing off-brand colors.
