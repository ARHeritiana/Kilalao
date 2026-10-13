# Kilalao colour palette

The palette is defined once, as CSS custom properties in `app/src/main/assets/style.css` (`:root`). `scripts/palette.py` generates and checks the values. Board code in `ui.js` may only use hex values that also appear as tokens; `tests/ui.test.js` enforces this.

## Principles

1. **Warm paper, indigo ink.** The background is a warm cream and the text is a deep indigo. Ink is never pure black, so contrast stays high (14.7:1) without glare.
2. **One brand colour.** Grape (`--primary`) marks the brand and the main action on a screen. Other hues mean something specific.
3. **Hue and lightness both carry the categories.** The five category colours differ in both hue and lightness. They therefore stay distinguishable in greyscale and for colour-blind players. The lightness and hue values come from a search that maximises the smallest colour difference under normal vision, protanopia, deuteranopia and tritanopia (Machado et al. 2009 simulation).
4. **Players are blue against orange.** This is the Okabe–Ito pairing. Player 1 is also darker than player 2 (luminance ratio 2.0), so the pair survives greyscale.
5. **Colour is never the only signal.** Every coloured element has a text label, an ink outline, or a shape cue. Sudoku conflicts also get a dashed border and a wavy underline.
6. **The Rubik's cube keeps its standard sticker colours,** because players recognise them.

## Tokens

| Role | Token | Value | Use |
|---|---|---|---|
| Background | `--paper` | `#fcf6e9` | Page |
| Surface | `--surface` | `#fffdfa` | Cards, buttons, dock |
| Sunken | `--sunken` | `#f5ecdd` | Empty cells, wells |
| Lines | `--line` / `--line-strong` | `#e7dbc7` / `#cfba9e` | Dividers / disabled borders, pegs |
| Text | `--ink` / `--ink-soft` / `--muted` | `#211d46` / `#3f3c66` / `#605f7f` | Text, outlines, press shadow |
| Brand | `--primary` / `-hover` / `-soft` | `#5f42d3` / `#6e59e2` / `#e9e9ff` | Main action, home banner, Favorites chip |
| Strategy | `--strategy` / `-soft` / `-deep` | `#c74b47` / `#fee7e4` / `#8c2d2b` | Coral |
| Numbers | `--numbers` / `-soft` / `-deep` | `#fdc436` / `#f9ebcf` / `#694e00` | Sunflower; also `--highlight` (selection, active tab, Hint) |
| Patterns | `--patterns` / `-soft` / `-deep` | `#60ddc0` / `#d2f6eb` / `#036150` | Mint; also `--success` |
| Spatial | `--spatial` / `-soft` / `-deep` | `#008eb3` / `#d6f2fe` / `#005c75` | Teal blue |
| Logic | `--logic` / `-soft` / `-deep` | `#6f1a76` / `#fbe4fc` / `#753479` | Plum |
| Player 1 | `--p1` | `#1570d1` | Fill and text |
| Player 2 | `--p2` / `--p2-text` | `#f68c36` / `#af4803` | Fill (with ink marks) / text |
| Error | `--danger` / `--danger-soft` | `#c93029` / `#fee7e4` | Conflicts, delete |

The river-crossing scene also uses thirteen `--art-*` illustration colours (skin, fur, wool, leaves, boat wood). They are for drawings only, never for controls or text.

Use the **soft** tints for backgrounds behind ink text, the **fill** colours for marks, chips and pieces outlined in ink, and the **deep** shades for white text on a coloured badge.

## Validation

`python3 scripts/palette.py out.json` runs 47 checks, and all of them pass:

- **Ink on every background and soft tint:** at least 13:1 (WCAG AAA). Ink on the sunflower fill is 9.6:1, and on the player 2 fill 6.6:1.
- **Muted text:** at least 5.1:1.
- **White on primary, player 1, error and every deep shade:** at least 4.5:1.
- **Coral as text:** only in headings of 24px or more, at least 4.3:1 (the large-text minimum is 3:1).
- **Fills against their surroundings:** at least 3:1 against the surface or the ink outline (WCAG 1.4.11).
- **Player 1 against player 2:** ΔE (OKLab ×100) is 38 for normal vision, 29 for protanopia, 38 for deuteranopia and 31 for tritanopia.
- **Closest pair of categories:** ΔE is 20 for normal vision and at least 14.8 under every colour-vision deficiency. The previous same-lightness palette dropped to 1.0, which is indistinguishable.

An axe-core WCAG 2.2 AA scan of home, learn, progress, all 24 games and two guides reports no violations.
