# Bundled STIX fonts

The website uses STIX Two Text (regular and italic, variable weight 400–700) and STIX Two Math. Font files are served from the same GitHub Pages site; no third-party font request is needed at runtime.

Sources retrieved 2026-09-09:

- https://github.com/google/fonts/tree/main/ofl/stixtwotext
- https://github.com/google/fonts/tree/main/ofl/stixtwomath
- Upstream project: https://github.com/stipub/stixfonts

The upstream TTF fonts were losslessly repackaged as WOFF2 with FontTools. Glyph outlines, names, variation axes and OpenType MATH tables are retained. The original SIL Open Font License files accompany the fonts in this directory.
