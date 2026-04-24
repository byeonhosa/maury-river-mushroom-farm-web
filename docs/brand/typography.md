# Typography — The Maury River Mushroom Farm

Source: `MRMF_Brand Guide_CMYK.pdf`, Brand Guide by Maycee Dryden.

## Brand Typefaces

| Use | Typeface | Weight / Style | Brand Guide Notes |
|---|---|---|---|
| Heading | Rafaella | Regular | Heading text is used in the main logo for “Maury River.” |
| Sub-heading | Kohinoor Devanagari | Light | Sub-heading type is used in the main logo for “the” and “Mushroom Farm.” |
| Body text | Athelas | Regular | Body text may be used for the website and other large bodies of text. |

## Recommended Website Usage

### Display / Hero Headings

Use **Rafaella Regular** for:

- Homepage hero headings
- Major campaign headlines
- Large brand-forward page titles
- Select editorial headings where a premium farm/food feel is desired

Do not overuse the display face. It should create brand recognition, not reduce readability.

### Section Sub-headings and Eyebrows

Use **Kohinoor Devanagari Light** for:

- Small uppercase section labels
- Sub-headings
- Navigation accents
- Short supporting lines beneath major headings
- Product category labels where appropriate

### Body Copy

Use **Athelas Regular** for:

- Product descriptions
- Mushroom education pages
- Recipe text
- Blog/article content
- Policy pages
- Long-form explanatory website copy

## Suggested Type Scale for Web Implementation

These are implementation recommendations for the website. They should be adjusted after visual testing with the actual font files.

| Element | Typeface | Suggested Size | Suggested Notes |
|---|---|---:|---|
| Hero heading | Rafaella Regular | 56-72px desktop / 40-48px mobile | Use generous line height and spacing. |
| Page title | Rafaella Regular | 44-56px desktop / 34-42px mobile | Use for primary page identity. |
| Section heading | Rafaella Regular or Athelas Regular | 32-44px desktop / 28-34px mobile | Prefer readability on content-heavy pages. |
| Eyebrow / label | Kohinoor Devanagari Light | 12-14px | Consider letter spacing and uppercase. |
| Product card title | Athelas Regular or Rafaella Regular | 22-28px | Use Rafaella sparingly if legible at the chosen size. |
| Body text | Athelas Regular | 17-19px | Prioritize readability. |
| Small text | Athelas Regular or system sans | 14-16px | Use for captions, metadata, notices, and form help text. |
| Button text | Kohinoor Devanagari Light or system sans | 14-16px | Use clear, readable labels. |

## CSS Variable Recommendation

```css
:root {
  --font-heading: "Rafaella", serif;
  --font-subheading: "Kohinoor Devanagari", system-ui, sans-serif;
  --font-body: "Athelas", Georgia, "Times New Roman", serif;
}
```

## Tailwind Font Family Recommendation

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        heading: ["Rafaella", "serif"],
        subheading: ["Kohinoor Devanagari", "system-ui", "sans-serif"],
        body: ["Athelas", "Georgia", "Times New Roman", "serif"],
      },
    },
  },
};
```

## Font Availability and Licensing Notes

- Do not assume Codex has access to the actual commercial font files.
- Do not commit font files unless the farm has the right license for web use.
- If the actual fonts are not available for development, use fallbacks temporarily while preserving the named font tokens above.
- Recommended temporary fallbacks:
  - Rafaella fallback: a high-contrast display serif.
  - Kohinoor Devanagari fallback: `system-ui`, `Inter`, or another clean sans-serif.
  - Athelas fallback: `Georgia` or another readable serif.

## Implementation Notes for Codex

- Define typography tokens early so the visual system can be applied consistently across the Next.js storefront.
- Use the brand typefaces for hierarchy, not decoration.
- Keep long-form educational content highly readable on mobile.
- Test font loading performance before production deployment.
- Avoid layout shift from late-loading webfonts by using appropriate font-display behavior.
