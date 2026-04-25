# Image Inventory

This inventory covers the owner-provided product and farm images added in
`assets/product-photos`, plus optimized storefront derivatives created for web delivery.
Original files are preserved unchanged.

## Original product and farm photos

| Original file                                                                  |  Dimensions |    Size | Likely subject                                                   | Recommended use                                                                             |
| ------------------------------------------------------------------------------ | ----------: | ------: | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Lions_mane_bag.jpg`                                                           | 3223 x 4239 |  8.2 MB | Lion's mane fruiting from a grow block held outdoors.            | Farm story, homepage hero, growing practice context.                                        |
| `Lions_mane_container.jpg`                                                     | 2802 x 4203 |  5.9 MB | Lion's mane mushrooms packed in berry baskets.                   | Fresh Lion's Mane product, market pickup context.                                           |
| `Lions_Mane.jpg`                                                               | 6513 x 4323 |  7.8 MB | Lion's mane cluster on a clean studio background.                | Species education or secondary product detail image.                                        |
| `lions_mane2.jpg`                                                              | 6513 x 4323 |  7.8 MB | Duplicate of `Lions_Mane.jpg` by SHA-256 hash.                   | Keep original; no separate web derivative needed.                                           |
| `oyster-mushroom.png`                                                          | 2953 x 2000 |  7.2 MB | White oyster mushroom cutout.                                    | White Oyster product/species image.                                                         |
| `pink_oyster_lions_mane.jpg`                                                   | 5712 x 4284 | 10.6 MB | Pink oyster and lion's mane growing from blocks.                 | Farm story, restaurant/chef visual, grow room context.                                      |
| `pink_oyster2.jpg`                                                             | 3168 x 4752 | 11.2 MB | Close-up of pink oyster gills.                                   | Pink Oyster species detail or editorial crop.                                               |
| `pink_oyster3.jpg`                                                             | 5115 x 3410 |  2.0 MB | Pink oyster cluster held outdoors.                               | Pink Oyster product image.                                                                  |
| `pink-oyster-mushroom-cut-out-on-transparent-background_38519421.png`          | 5527 x 3105 | 13.0 MB | Pink oyster cutout on transparent background.                    | Optional campaign or category art after license/source review.                              |
| `Turkey_tail.jpg`                                                              | 3264 x 2448 |  4.1 MB | Turkey tail mushrooms.                                           | Functional mushroom education only after content review.                                    |
| `turkey-tail-mushroom.jpg`                                                     | 6720 x 2880 |  5.7 MB | Wide turkey tail mushroom photo.                                 | Functional mushroom education only after content review.                                    |
| `various_mushrooms.jpg`                                                        | 5834 x 3428 | 20.2 MB | Mixed gourmet mushrooms, including golden oyster-style clusters. | Mixed box, chef mix, restaurant/wholesale visuals.                                          |
| `vecteezy_hand-drawn-set-of-medicinal-mushrooms-such-as-shiitaki_25535878.jpg` | 1920 x 1536 |  429 KB | Third-party medicinal mushroom illustration.                     | Do not use on launch pages until license and brand fit are confirmed.                       |
| `wild_oyster.jpg`                                                              | 4000 x 2248 |  1.9 MB | Oyster mushrooms growing in a woodland setting.                  | General education only; avoid using as a farm product photo unless provenance is confirmed. |
| `Young_lions_mane_bag.jpg`                                                     | 6000 x 3375 | 11.1 MB | Young lion's mane mushrooms on grow blocks.                      | Our Farm page and cultivation context.                                                      |

## Optimized storefront derivatives

Optimized files are stored under `apps/storefront/public/images`. They were generated
with `sharp-cli` as WebP at quality 82 and resized to sensible display widths.

| Optimized file                                         | Approx. dimensions |   Size | Source file                          | Current use                                                                         |
| ------------------------------------------------------ | -----------------: | -----: | ------------------------------------ | ----------------------------------------------------------------------------------- |
| `images/products/lions-mane-mushrooms-01.webp`         |        1400 x 2100 | 169 KB | `Lions_mane_container.jpg`           | Fresh Lion's Mane product cards/details, Markets & Pickup page.                     |
| `images/products/lions-mane-mushrooms-studio-01.webp`  |        1600 x 1062 |  67 KB | `Lions_Mane.jpg`                     | Lion's Mane species page.                                                           |
| `images/products/white-oyster-mushrooms-01.webp`       |         1400 x 948 | 134 KB | `oyster-mushroom.png`                | White Oyster product cards/details and species page.                                |
| `images/products/pink-oyster-mushrooms-01.webp`        |        1400 x 2100 | 256 KB | `pink_oyster2.jpg`                   | Pink Oyster species page.                                                           |
| `images/products/pink-oyster-mushrooms-02.webp`        |         1400 x 933 |  72 KB | `pink_oyster3.jpg`                   | Pink Oyster product cards/details.                                                  |
| `images/products/pink-oyster-mushrooms-cutout-01.webp` |         1400 x 786 |  93 KB | Long pink oyster cutout PNG filename | Created but not currently used.                                                     |
| `images/products/mixed-gourmet-mushrooms-01.webp`      |         1600 x 940 | 175 KB | `various_mushrooms.jpg`              | Mixed Gourmet Mushroom Box, Chef's Weekly Mushroom Mix, Restaurants/Wholesale page. |
| `images/products/wild-oyster-mushrooms-01.webp`        |         1600 x 899 | 111 KB | `wild_oyster.jpg`                    | Created but not currently used because provenance is uncertain.                     |
| `images/farm/lions-mane-growing-block-01.webp`         |        1600 x 2105 | 328 KB | `Lions_mane_bag.jpg`                 | Homepage hero.                                                                      |
| `images/farm/young-lions-mane-growing-blocks-01.webp`  |        1800 x 1013 | 138 KB | `Young_lions_mane_bag.jpg`           | Our Farm page.                                                                      |
| `images/farm/mixed-mushrooms-growing-blocks-01.webp`   |        1600 x 1200 | 250 KB | `pink_oyster_lions_mane.jpg`         | Homepage farm story panel.                                                          |
| `images/farm/turkey-tail-mushrooms-01.webp`            |        1600 x 1200 | 596 KB | `Turkey_tail.jpg`                    | Created but not currently used.                                                     |
| `images/farm/turkey-tail-mushrooms-02.webp`            |         1600 x 686 | 187 KB | `turkey-tail-mushroom.jpg`           | Created but not currently used.                                                     |

## Images still needed before launch

- Exact Blue Oyster product photography.
- Exact Golden Oyster product photography.
- Packaged product photos for mushroom salt, dried oyster mushrooms, lion's mane capsules, and any powders.
- Market table, farm exterior, delivery, and pickup-window lifestyle photos.
- Final review of image provenance and usage rights.
- Final alt text review with the owner before launch.
- Production image optimization review once the final photo set is selected.
