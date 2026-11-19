---
name: Aurora Finance
colors:
  surface: '#0b112f'
  surface-dim: '#0b112f'
  surface-bright: '#323757'
  surface-container-lowest: '#060b29'
  surface-container-low: '#131937'
  surface-container: '#181d3c'
  surface-container-high: '#222847'
  surface-container-highest: '#2d3352'
  on-surface: '#dee1ff'
  on-surface-variant: '#c9c4d8'
  inverse-surface: '#dee1ff'
  inverse-on-surface: '#292e4d'
  outline: '#938ea1'
  outline-variant: '#484555'
  surface-tint: '#cabeff'
  primary: '#cabeff'
  on-primary: '#30009a'
  primary-container: '#937dff'
  on-primary-container: '#2a0088'
  inverse-primary: '#603ce3'
  secondary: '#3ee3a5'
  on-secondary: '#003825'
  secondary-container: '#00c68b'
  on-secondary-container: '#004c33'
  tertiary: '#c7bfff'
  on-tertiary: '#2e256d'
  tertiary-container: '#9087d5'
  on-tertiary-container: '#271d66'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e6deff'
  primary-fixed-dim: '#cabeff'
  on-primary-fixed: '#1c0062'
  on-primary-fixed-variant: '#4716cb'
  secondary-fixed: '#60fdbd'
  secondary-fixed-dim: '#3ae0a2'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#e4dfff'
  tertiary-fixed-dim: '#c7bfff'
  on-tertiary-fixed: '#180a58'
  on-tertiary-fixed-variant: '#453d85'
  background: '#0b112f'
  on-background: '#dee1ff'
  surface-variant: '#2d3352'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  metric-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  metric-md:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  metric-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an atmospheric, high-precision dark-mode interface designed for high-frequency digital banking and decentralized asset operations. It bridges institutional financial rigor with the fluidity of Web3 primitives.

### Brand Personality & Emotional Impact
- **Luminous Precision:** Crisp, technical legibility balanced by ethereal lighting phenomena. The UI projects authority, absolute mathematical integrity, and forward-looking momentum.
- **Calm Mastery:** Eliminates cognitive stress around complex multi-asset portfolios by utilizing deep-space navy canvases punctuated by high-contrast typographic hierarchies.
- **Ambient Velocity:** Dynamic atmospheric lighting creates depth and tangible hierarchy without cluttering actionable controls.

### Design Movement
- **Atmospheric FinTech:** A hybrid of refined dark-mode minimalism and translucent glassmorphism. Surfaces leverage tonal structural tiers layered with translucent glass cards, restrained single-pixel hairline borders (`rgba(255, 255, 255, 0.1)`), and back-layer aurora mesh lighting blurs (`blur-3xl`) operating at controlled opacities.

## Colors

The color architecture is built strictly for dark-mode financial clarity, utilizing luminous accents against deep indigo-navy base values.

### Core Canvas & Surface System
- **Background (Canvas Deep Night):** `#0C1230` — Foundation level for viewport canvases, root app layouts, and page frame containers.
- **Surface Elevation 1 (Card Default):** `#141B42` — Raised structural layers for primary metric cards, portfolio tables, and container panels.
- **Surface Elevation 2 (Raised / Flyout):** `#1C2559` — Popovers, dropdown menus, context trays, and active modal overlays.
- **Surface Glass / Translucent Overlay:** `rgba(20, 27, 66, 0.75)` combined with `backdrop-blur-md` for floating docks, sticky navigation, and modal backdrops.

### Accent & Functional Semantics
- **Aurora Violet (`#7B5CFF`):** Brand primary accent. Used for primary CTAs, active segmented tab pills, focused form rings, and selected state indicators.
- **Aurora Green (`#43E6A8`):** Semiotic positive indicators, received transaction tallies, positive yields (APR/APY), and operational success badges.
- **Aurora Coral / Critical (`#FF5C7A`):** Network warning flags, negative delta metrics, withdrawal debits, and destructive actions.
- **Aurora Amber (`#FFC247`):** Pending blockchain confirmations, slippage warnings, and intermediate transaction states.

### Typography & Content Shades
- **Text Primary (Mist):** `#EEF0FF` — Maximum contrast for balances, key metrics, and primary headings.
- **Text Secondary (Soft Lilac):** `#B7AEFF` — Informational metadata, table headers, breadcrumbs, and inactive label states.
- **Text Tertiary / Disabled:** `rgba(183, 174, 255, 0.45)` — Placeholder values, non-interactive hints, and trailing unit annotations.
- **Structural Stroke / Hairline:** `rgba(255, 255, 255, 0.10)` — Consistent 1px borders across all card containers and divider rules.

### Mesh Gradient Spec
- Atmospheric Aurora: Linear/Radial blend of `#7B5CFF` (opacity 30%), `#43E6A8` (opacity 20%), and `#2C5282` (opacity 15%), softened through `blur-3xl` positioned under key summary sections and metric clusters.

## Typography

Typography balances contemporary humanist geometry with strict numerical alignment.

### Roles and Type Pairings
- **Headlines & Structural Titles (`Plus Jakarta Sans`):** Selected for wide, geometric letterforms that remain open and commanding at display scales. Headings must leverage negative tracking to enhance density.
- **Interface & Operational Copy (`Inter`):** Neutral, utilitarian body typography engineered for small-scale readability across transaction feeds and interactive parameters.
- **Financial Metrics & Hash Identifiers (`JetBrains Mono`):** Applied to monetary figures, exchange deltas, wallet addresses, and timestamps. Always set with `font-feature-settings: "tnum" 1` to guarantee vertical decimal alignment across ledger lists.

### Scaling & Rules
- Headings scale dynamically across breaklines to prevent visual awkwardness on mobile views.
- Metric values above `28px` must switch to compact abbreviation formatting (e.g., `$1.42M` instead of `$1,420,104.22`) on mobile devices.

## Layout & Spacing

The layout is structured around an adaptive 12-column grid system tuned for dense financial analytics and responsive multi-panel operations.

### Grid & Breakpoints
- **Desktop (≥ 1280px):** 12-column layout with fixed 24px (`1.5rem`) gutters and variable margins maxed at `1440px` content container width. Sidebar pinned at `260px` or `80px` collapsed.
- **Tablet (768px – 1279px):** 8-column layout with 16px (`1rem`) gutters and 24px margins. Subordinate charts reflow beneath metric cards.
- **Mobile (< 768px):** 4-column layout with 16px (`1rem`) gutters and 16px (`1rem`) canvas margins. Panels stack vertically into singular scroll sequences.

### Layout Principles
- **Strict 4px/8px Baseline Rhythm:** All inner component padding, gaps, and content margins derive from the 8-point base scale (`space-xs` through `space-2xl`).
- **Dense Grouping:** Related metric/delta groups share `space-xs` (4px) to `space-sm` (8px). Structural cards and card sections maintain `space-lg` (24px) breathing room.

## Elevation & Depth

Hierarchy in this design system is created through light diffusion, surface tonal shifts, and low-contrast borders rather than traditional dropshadows.

### Structural Levels
- **Level 0 (Canvas):** Pure `#0C1230`. Flat surface backdrop.
- **Level 1 (Card & Module Foundation):** Solid `#141B42` or translucent `rgba(20, 27, 66, 0.70)` with `backdrop-blur-md`. Encased in an exterior 1px border of `rgba(255, 255, 255, 0.10)`. No dropshadow.
- **Level 2 (Hovered Cards & Interactive Blocks):** Border shifts to `rgba(255, 255, 255, 0.18)`. A faint, diffuse ambient glow is cast: `0 8px 32px -4px rgba(12, 18, 48, 0.8), 0 0 24px -2px rgba(123, 92, 255, 0.12)`.
- **Level 3 (Modals, Overlays & Sticky Bars):** Surface `#1C2559` or `rgba(28, 37, 89, 0.85)` with `backdrop-blur-xl`. Outer border `rgba(255, 255, 255, 0.14)` with deep shadow: `0 24px 48px -12px rgba(0, 0, 0, 0.5)`.

### Aurora Atmospheric Layering
- Decorative ambient blurs sit on a Dedicated z-index layer (`z-0`) immediately above the background canvas.
- Mesh blobs must use `mix-blend-mode: screen` or natural translucent opacity (max 30%) with `filter: blur(80px)` to avoid distracting from high-contrast data metrics.

## Shapes

The geometric signature combines tailored 18px radii for data modules with compact, ergonomic curves for inputs and controls.

### Radius System
- **Cards & Data Modules:** Explicitly set to `18px` (`1.125rem`). This distinctive curve softens the technical nature of data density while maintaining structural alignment.
- **Buttons, Form Inputs & Select Triggers:** Standardized at `10px` to `12px` to sit proportionally inside the 18px card containers.
- **Pills, Chips & Currency Badges:** Fully rounded (`rounded-full` / `9999px`) to immediately differentiate categorical tags and token badges from rectangular containers.
- **Inner Nested Blocks:** Any secondary container nested inside an 18px parent card must use `10px` or `12px` to ensure concentric visual harmony.

## Components

### Buttons & Interactive Triggers
- **Primary CTA:** Solid Aurora Violet (`#7B5CFF`) background, crisp `#FFFFFF` text, `font-weight: 600`, 12px roundedness.
  - *Hover:* Background adjusts to `#8E73FF` with a subtle radial glow `box-shadow: 0 0 20px rgba(123, 92, 255, 0.45)`.
  - *Active:* Scaled down to `0.98` with glow consolidated to `0 0 10px rgba(123, 92, 255, 0.60)`.
- **Secondary CTA:** Translucent surface `rgba(255, 255, 255, 0.06)`, 1px border `rgba(255, 255, 255, 0.10)`, text Mist (`#EEF0FF`).
  - *Hover:* Surface elevates to `rgba(255, 255, 255, 0.12)` with border `rgba(255, 255, 255, 0.20)`.
- **Positive Action (Buy / Receive / Confirm):** Subtle Aurora Green translucent wash `rgba(67, 230, 168, 0.12)`, border `rgba(67, 230, 168, 0.30)`, text `#43E6A8`. Hover adds ambient green glow.

### Cards & Panels
- **Standard Metric / Data Card:** Background `#141B42`, border `1px solid rgba(255, 255, 255, 0.10)`, corner radius `18px`, inner padding `24px` (`space-lg`).
- **Glass / Hero Summary Card:** Background `rgba(20, 27, 66, 0.65)`, `backdrop-blur-lg`, border `1px solid rgba(255, 255, 255, 0.12)`, corner radius `18px`. An aurora mesh softly shines through the backdrop.

### Chips, Tags & Badges
- **Token / Currency Pill:** Capsule shape (`rounded-full`), padding `4px 12px`, background `rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.08)`. Features circular asset icon (`16px`) paired with monospace ticker label (`metric-sm`).
- **Delta Indicator (Gain):** Text `#43E6A8`, background `rgba(67, 230, 168, 0.10)`, border `1px solid rgba(67, 230, 168, 0.20)`, uppercase monospace tracking.
- **Delta Indicator (Loss):** Text `#FF5C7A`, background `rgba(255, 92, 122, 0.10)`, border `1px solid rgba(255, 92, 122, 0.20)`.

### Form Fields & Inputs
- **Base Input Container:** Background `#0F1538`, 1px border `rgba(255, 255, 255, 0.10)`, corner radius `12px`, typography `Inter 14px`, text Mist (`#EEF0FF`), placeholder Soft Lilac at 45% opacity.
- **Focus State:** Border transitions to `#7B5CFF`, accompanied by outer focus halo `0 0 0 3px rgba(123, 92, 255, 0.25)`.
- **Amount Input:** Integrated numeric display utilizing `JetBrains Mono` (`24px`–`32px`), right-aligned inline token selector chip.

### Checkboxes & Radio Buttons
- **Checkboxes:** Size `18px` by `18px`, rounded `5px`. Background `#0F1538`, border `1px solid rgba(255, 255, 255, 0.20)`.
  - *Checked:* Solid `#7B5CFF` fill, white checkmark, subtle violet box glow.
- **Radio Buttons:** Size `18px`, fully round (`rounded-full`), border `1px solid rgba(255, 255, 255, 0.20)`.
  - *Active:* Solid border `#7B5CFF`, inner concentric solid dot `#7B5CFF` spaced with a 3px dark gap.

### Lists & Transaction Tables
- **Table Structure:** Borderless rows encased in parent 18px card containers. Alternating rows highlighted by subtle hover state (`rgba(255, 255, 255, 0.02)`).
- **Divider:** Subtle hairline `1px solid rgba(255, 255, 255, 0.06)` separating line items.
- **Numeric Alignment:** All values, hashes, and percentage deltas set to `JetBrains Mono` and right-aligned with fixed column widths.