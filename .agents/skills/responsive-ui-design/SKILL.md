---
name: responsive-ui-design
description: >-
  Design system specifications, responsive breakpoint guidelines, and UI component
  patterns for mobile and desktop screens in My Cookbook.
---

# Responsive UI & Design System Guide for My Cookbook

This skill guides the design and implementation of cozy, accessible, and responsive user interfaces for both mobile and desktop screens in the My Cookbook application.

---

## 1. Aesthetic: "Strawberry Milk & Butter"

All components should feel warm, friendly, tactile, and appetizing:

### Color Palette
- **Blush / Background:** `#FFF5F7` (`bg-[#FFF5F7]`)
- **Card Cream:** `#FFFFFF` (`bg-white`)
- **Butter Accent:** `#FFE599` / light `#FFF9E6`
- **Strawberry Primary:** `#FF8FA3` (hover: `#FF758F`, light tint: `#FFF0F3`)
- **Berry Text:** Primary `#4A2C2A`, Muted `#8A6866`, Border `#F3D5DC`

### Typography & Elevations
- **Headings & Display:** `Playfair Display` serif (`font-display`, `font-serif`)
- **Body & Controls:** `Quicksand` sans-serif
- **Shadows:**
  - `shadow-cozy`: Soft ambient warm card shadow
  - `shadow-cozy-lg`: Elevated modal / popover shadow
  - `shadow-pink-glow`: Active strawberry button / badge glow

---

## 2. Responsive Breakpoint Conventions

Use Tailwind CSS v4 responsive prefixes to optimize layouts across screen sizes:

| Breakpoint | Target Devices | Navigation & Layout Pattern |
| :--- | :--- | :--- |
| **Mobile (`< 768px`)** | iPhones, Android phones | Fixed `BottomNav` with `pb-safe`, single-column cards, full-bleed modals, horizontal scrolling pill carousels (`no-scrollbar`). |
| **Tablet (`768px - 1024px`)** | iPads, foldables | 2-column recipe grid (`md:grid-cols-2`), compact header action bar, side-by-side ingredient & step view. |
| **Desktop (`≥ 1024px`)** | Laptops, wide monitors | 3-column recipe grid (`lg:grid-cols-3`), max-w-5xl/6xl centered container, modal dialogs with backdrop blur, sticky filters. |

---

## 3. Mobile-First UX Rules

1. **Touch Targets:**
   - Interactive elements (buttons, checkboxes, navigation icons) must have a minimum tap area of **44×44px** (use `p-2` or `p-2.5` padding).
2. **Bottom-Nav Clearance:**
   - Any scrollable view must include bottom padding (`pb-24` or `pb-28`) so content is never obscured by `BottomNav`.
3. **Safe Area Insets:**
   - Account for iPhone notch and home indicator using `pb-safe` on fixed navigation bars.
4. **Haptic & Visual Feedback:**
   - Use `active:scale-95` or `transition-transform` on mobile buttons and cards for tactile feedback.

---

## 4. Desktop UX Enhancements

1. **Hover States:**
   - Add gentle hover micro-interactions: `hover:-translate-y-0.5 hover:shadow-cozy-lg transition-all duration-200`.
2. **Multi-Column Workflows:**
   - Meal planner displays the full 7-day calendar horizontally on desktop (`md:grid-cols-7` or side-by-side days).
   - Recipe detail displays ingredients in a sticky left column and cooking instructions on the right.
3. **Print Optimization:**
   - Preserve clean `@media print` styling: hide `no-print` navigational controls, expand cards to full width, and remove pink background colors.

---

## 5. UI Testing with Chrome DevTools

Use the installed Chrome DevTools MCP tools to verify viewport scaling and accessibility:
- Test mobile viewports: iPhone 14/15 (`390x844`), Pixel 7 (`412x915`).
- Test desktop viewports: `1280x800` and `1920x1080`.
- Run accessibility checks on contrast ratios between text `#4A2C2A` / `#8A6866` and backgrounds `#FFF5F7` / `#FFE599`.
