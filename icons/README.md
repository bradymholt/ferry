# Icons

The mark is a white arrow crossing a wake, on a blue vertical gradient.

Two sources, because the detailed wake blurs into a solid band below 48px. The small
variant compensates with a single thicker wave and a larger arrow.

| Source | Used for |
|---|---|
| `icon-small.svg` | `icon16.png`, `icon32.png` |
| `icon.svg` | `icon48.png`, `icon128.png` |

Keep that mapping when regenerating — rendering every size from `icon.svg` is the obvious
shortcut and it is what makes the toolbar icon muddy.

## Regenerate

Requires [`librsvg`](https://formulae.brew.sh/formula/librsvg) (`brew install librsvg`).

```bash
cd icons
rsvg-convert -w 16  -h 16  icon-small.svg -o icon16.png
rsvg-convert -w 32  -h 32  icon-small.svg -o icon32.png
rsvg-convert -w 48  -h 48  icon.svg       -o icon48.png
rsvg-convert -w 128 -h 128 icon.svg       -o icon128.png
```

## Checking small sizes

Pixel-doubling with nearest-neighbour shows what the 16px render actually looks like,
which a scaled-up smooth preview hides:

```bash
magick icon16.png -filter point -resize 800% /tmp/check16.png && open /tmp/check16.png
```
