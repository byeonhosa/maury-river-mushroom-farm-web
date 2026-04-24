# Generated SVG Review

Temporary SVG files were created for development planning only. They are not official
brand master files and should be replaced if the designer provides proper SVG/vector
exports.

## Conversion method

The current files are SVG wrappers that reference the original PNG artwork. They were
not path-traced into true vector geometry. This preserves the visible PNG artwork while
allowing development code to treat the asset as an SVG during early scaffolding.

## Files

| Source PNG | Generated SVG | Quality concerns | Development status |
|---|---|---|---|
| `assets/brand-source/MRMF_PrimaryLogo_Mahogany.png` | `assets/brand-generated-svg/primary-logo-mahogany.generated.svg` | Not true vector; scales the embedded PNG; depends on the source PNG remaining in place. | Acceptable for development only. |
| `assets/brand-source/MRMF_Alt_Mahogany_.png` | `assets/brand-generated-svg/alternate-logo-mahogany.generated.svg` | Not true vector; scales the embedded PNG; depends on the source PNG remaining in place. | Acceptable for development only. |
| `assets/brand-source/MRMF_BrandMark_Mahogany.png` | `assets/brand-generated-svg/brandmark-mahogany.generated.svg` | Not true vector; scales the embedded PNG; depends on the source PNG remaining in place. | Acceptable for development only. |

## Recommendation

Use the original PNGs or these wrappers during implementation, but do not present these
generated SVGs as official logo files. Request official vector exports before final
production launch.
