# Generated SVG Review

Temporary SVG files in `assets/brand-generated-svg` are generated/interim assets only.
They are not official designer-provided vector masters and should be replaced when
proper SVG/vector exports are available.

## Review summary

- All reviewed SVG files are valid XML and include a `viewBox`.
- All reviewed files contain raster image references or embedded raster image data.
- None of the current generated SVG files should be treated as true vector artwork.
- The storefront should continue using the approved PNG logo files for now; the generated
  SVGs are available for development experiments only.
- `mrmf-patterns-bw.generated.svg` is especially large at about 9.1 MB and is unsuitable
  for normal website delivery.

## Files

| Generated SVG                           | Likely source PNG                                   | Type               | ViewBox |   Size | Technical concerns                                                                | Recommendation                                |
| --------------------------------------- | --------------------------------------------------- | ------------------ | ------- | -----: | --------------------------------------------------------------------------------- | --------------------------------------------- |
| `alternate-logo-mahogany.generated.svg` | `assets/brand-source/MRMF_Alt_Mahogany_.png`        | Raster-wrapper SVG | Yes     |  486 B | References PNG artwork; not scalable vector geometry; depends on source PNG path. | Usable for development only.                  |
| `brandmark-mahogany.generated.svg`      | `assets/brand-source/MRMF_BrandMark_Mahogany.png`   | Raster-wrapper SVG | Yes     |  481 B | References PNG artwork; not scalable vector geometry; depends on source PNG path. | Usable for development only.                  |
| `primary-logo-mahogany.generated.svg`   | `assets/brand-source/MRMF_PrimaryLogo_Mahogany.png` | Raster-wrapper SVG | Yes     |  481 B | References PNG artwork; not scalable vector geometry; depends on source PNG path. | Usable for development only.                  |
| `logo-test.generated.svg`               | `assets/brand-source/Logo Test.png`                 | Raster-wrapper SVG | Yes     | 799 KB | Embedded raster data; larger than the source PNG; not a true vector logo.         | Needs designer replacement before production. |
| `mrmf-alt-bw.generated.svg`             | `assets/brand-source/MRMF_Alt_BW_.png`              | Raster-wrapper SVG | Yes     | 198 KB | Embedded raster data; not a true vector logo.                                     | Needs designer replacement before production. |
| `mrmf-alt-burnt-orange.generated.svg`   | `assets/brand-source/MRMF_Alt_BurntO_.png`          | Raster-wrapper SVG | Yes     | 243 KB | Embedded raster data; not a true vector logo.                                     | Needs designer replacement before production. |
| `mrmf-brandmark-bw.generated.svg`       | `assets/brand-source/MRMF_BrandMark_BW_.png`        | Raster-wrapper SVG | Yes     | 438 KB | Embedded raster data; not a true vector brandmark.                                | Needs designer replacement before production. |
| `mrmf-patterns-bw.generated.svg`        | `assets/brand-source/MRMF_Patterns_BW_.png`         | Raster-wrapper SVG | Yes     | 9.1 MB | Extremely large embedded raster pattern; not suitable for site delivery.          | Unsuitable for production website use.        |
| `mrmf-primary-logo-bw.generated.svg`    | `assets/brand-source/MRMF_PrimaryLogo_BW.png`       | Raster-wrapper SVG | Yes     | 508 KB | Embedded raster data; not a true vector logo.                                     | Needs designer replacement before production. |
| `mrmf-primary-logo-bw-1.generated.svg`  | `assets/brand-source/MRMF_PrimaryLogo_BW_1.png`     | Raster-wrapper SVG | Yes     | 290 KB | Embedded raster data; not a true vector logo.                                     | Needs designer replacement before production. |

## Storefront decision

Generated SVGs were not wired into the storefront in this asset batch because they are
raster wrappers and several are heavier than the existing PNG files. Header and hero
logo usage should remain on the existing PNG assets until official vector exports are
provided or a designer approves a production SVG set.
