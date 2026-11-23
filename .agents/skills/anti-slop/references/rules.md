# Anti-Slop Comprehensive Rules Reference

This reference document expands upon the core Anti-Slop rules, providing detailed diagnostic criteria for auditing code, copy, and UI layouts.

---

## Complete Rule Directory

### Tier 1: Hard Gate Rules (Non-Negotiable)

#### R-01: Authentic Voice & Prohibited AI Tropes
- **Banned Words & Phrases:**
  - `delve`, `delving into`
  - `pivotal`, `testament to`, `beacon of`
  - `seamless`, `seamlessly integrated`
  - `elevate your experience`, `revolutionize`
  - `game-changer`, `unlock the power`
  - `tapestry`, `kaleidoscope`, `supercharge`
- **Authenticity Audit:**
  - Never fabricate statistics ("Used by 99% of top chefs").
  - Never generate fake user review quotes unless explicitly requested as mockup fixtures.
  - Headlines must state the real product capability directly.

#### R-02: Functional Integrity & Tactile Controls
- Every button element (`<button>`) must have an active `onClick` handler, form submit role, or explicit disabled state.
- Floating action buttons must not obscure footer navigation or safe-area margins.
- Modals and drawers must have working dismiss handlers (Escape key, backdrop click, Close icon).

#### R-03: Accessibility & Inclusive Design (WCAG 2.2 AA)
- Text contrast must exceed 4.5:1 against its background.
- Focus rings must be clearly visible on keyboard navigation (`focus-visible:ring-2 focus-visible:ring-offset-2`).
- Interactive touch targets must measure at least 44×44px on mobile viewports.
- Screen readers must be supported via semantic HTML tags (`<main>`, `<nav>`, `<header>`, `<article>`) and descriptive `aria-label` attributes on icon-only buttons.

#### R-04: Code Hygiene & Type Safety
- Reject unjustified `any` types or `@ts-ignore` / `@ts-nocheck` directives.
- Catch blocks must handle errors or log context; silent swallows are prohibited.
- Do not generate redundant comments that echo the code syntax.

---

## Tier 2: Purpose-Gate Rules (Justification Required)

#### R-10: Intentional Color Application
- Reject default AI neon gradients (indigo/violet/cyan) unless mandated by a specific brand asset.
- Gradients must have a clear lighting or directional purpose rather than functioning as filler background texture.

#### R-11: Content-Driven Layouts
- Reject cookie-cutter 3-card bento grids when the content types differ in importance or structure.
- Match layout patterns to actual data requirements (lists for scannability, tables for dense comparison, cards for visual discovery).

#### R-12: Surface Layering & Material Integrity
- Limit backdrop blur (`backdrop-blur`) to floating and overlay surfaces (modals, sticky navs, floating toasts).
- Avoid gratuitous frosted-glass treatments on base content cards.

#### R-13: Meaningful Indicators & Badges
- Do not place sparkle icons (`✨`) or arbitrary "AI" badges next to features that do not use machine intelligence.
- Status badges must represent real system states (e.g., "Offline", "Saved", "Syncing").

---

## Tier 3: Quality Locks

#### R-20: Design System Token Consistency
- Always use the project's configured design tokens (colors, font families, box shadows, border radiuses) over arbitrary arbitrary Tailwind values (e.g. `p-[17px]`, `rounded-[23px]`).

#### R-21: Viewport & Breakpoint Reflow
- Validate components at:
  - Mobile: `390px` width
  - Tablet: `768px` width
  - Desktop: `1280px` width
- Ensure zero horizontal overflows and proper safe-area padding (`pb-safe`, `pt-safe`).
