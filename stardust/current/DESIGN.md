<!-- stardust:provenance writtenBy=stardust:extract writtenAt=2026-11-02 sources=stardust/current/_computed-styles.json,stardust/current/_brand-extraction.json mode=descriptive -->
---
name: Tata Capital
description: Descriptive design system of www.tatacapital.com as captured 2026-11-02 (10 pages, 1440 + 360).
colors:
  text: "#333333"
  background: "#ffffff"
  primary: "#1961ac"
  primary-hover: "#165ca4"
  primary-deep: "#0f5197"
  border: "#707070"
  surface: "#e0e0e0"
  surface-mint: "#eaf4f2"
  surface-sky: "#edf8ff"
  secondary: "#b369ab"
  lavender: "#b287d4"
  accent-lime: "#d8e024"
  accent-lime-soft: "#d9e051"
  black: "#000000"
typography:
  h1:
    fontFamily: "OpenSans-Light, Open Sans, sans-serif"
    fontSize: "40px"
    fontWeight: 400
  h2:
    fontFamily: "OpenSans-Light, Open Sans, sans-serif"
    fontSize: "34px"
    fontWeight: 400
  h3:
    fontFamily: "OpenSans-SemiBold, Open Sans, sans-serif"
    fontSize: "20px"
    fontWeight: 400
  card-title:
    fontFamily: "OpenSans-SemiBold, Open Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
  body:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  small:
    fontFamily: "Open Sans, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  button:
    fontFamily: "OpenSans-SemiBold, Open Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  pill: "30px"
  circle: "50%"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.pill}"
    typography: "{typography.button}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-accent:
    backgroundColor: "{colors.accent-lime}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
---

## Overview

A corporate financial-services site (an Indian NBFC) built on AEM Sites. Blue header bar with a white/lime wordmark, white page body, pale mint / sky / lavender gradient washes behind sections, rounded white cards with very soft shadows, pill buttons in brand blue or lime. Open Sans throughout, loaded as separate per-weight families (`OpenSans-Light`, `OpenSans-Regular`, `OpenSans-SemiBold`, `OpenSans-Bold`).

## Colors

Brand blue `#1961ac` carries the header, primary buttons and links; lime `#d8e024` is the accent (secondary buttons, link hover on dark, wordmark). Text is `#333333` on white. Section washes use `#eaf4f2`, `#edf8ff` and lavender gradients (`#b287d4`). Source: `_computed-styles.json#aggregate.colors`.

## Typography

Headings are light (`OpenSans-Light`, 40/34 px) or semibold (`OpenSans-SemiBold`, 26/22/20/16 px); body copy is Open Sans 13–15 px; buttons are SemiBold 12 px. The scale is ad hoc (40/34/26/22/20/16/14/13/12). Weight is expressed through the family name, not `font-weight`.

## Layout

Centred content column (container measured by cap-probe into `DESIGN.json#extensions.breakpoints`). Sticky blue header with a utility bar above; long product pages with an in-page tab bar. Mobile (360) stacks cards into one column and swaps the nav for a drawer.

## Elevation & Depth

Cards use a near-invisible multi-layer shadow (`rgba(0,0,0,0.01) -5px 0 10px …`) or `rgba(0,0,0,0.05) 0 3.6px 36px`; buttons gain a soft blue shadow on hover.

## Shapes

Pill radius 30 px on buttons and inputs; circles (50%) for icon wells and carousel arrows; cards rounded 10–20 px.

## Components

Header (utility strip + main nav + search + Login/Apply), loan product cards, EMI calculator (sliders), FAQ accordion, newsletter band, share bar, footer with link columns and social icons, floating lead-capture popup.

## Do's and Don'ts

Descriptive snapshot — no rules beyond what the live site does.
