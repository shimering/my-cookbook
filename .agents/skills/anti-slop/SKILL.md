---
name: anti-slop
description: >-
  Rules and quality-control filter for AI coding agents to eliminate generic AI tropes,
  boilerplate code, hollow copywriting, and cookie-cutter UI designs. Run during generation
  or as an audit pass before delivering changes.
---

# Anti-Slop: Quality Control Filter for AI Coding Agents

Anti-Slop is an opinionated quality-control filter designed to prevent AI coding agents from generating formulaic, sterile, or cliché outputs ("AI slop") across UI design, copywriting, and code architecture.

> **Note:** Anti-Slop is a **filter, not a style guide**. It does not enforce a rigid aesthetic (no forced fonts or colors). Instead, it tests every design and implementation choice against a strict **purpose test** and relies on the project's design system (e.g. `responsive-ui-design` and `AGENTS.md`) for creative direction.

---

## 1. Operating Modes

### Mode 1: Active Generation (Default)
Apply these rules continuously while writing code, creating components, or authoring UI:
1. **Pre-flight Check:** Ground elements in the project's design tokens and theme rather than inventing standard generic layouts.
2. **Purpose Test:** For every decorative visual element (gradients, shadows, badges, cards), articulate what functional or hierarchy purpose it serves.
3. **Delivery Gate:** End with a 4-block Delivery Gate report before marking the task complete.

### Mode 2: Audit Mode
When asked to review, audit, or clean up an existing screen, component, or codebase:
1. Scan the target file(s) against the rules in Section 2.
2. Produce a numbered audit report in `anti-slop/audit-###-YYYY-MM-DD.md` citing:
   - Finding Number (`#001`, `#002`, ...)
   - Rule Violated (`R-XX`)
   - Severity / Tier (High = Hard Gate, Medium = Purpose-Gate, Low = Quality Lock)
   - Specific File & Line Reference
   - Recommended Fix
3. Wait for approval before modifying any code.

---

## 2. The Three Rule Tiers

### Tier 1: Hard Gate (Absolute Prohibitions — Zero Exceptions)
*Violating any Hard Gate rule results in an immediate automatic FAIL.*

- **R-01 (Honesty & Authentic Copy):**
  - No fake metrics, fabricated testimonial quotes, or made-up claims (e.g., "Trusted by 10,000+ chefs").
  - Ban empty AI hype words: `delve`, `elevate`, `seamless`, `game-changer`, `tapestry`, `beacon`, `revolutionize`, `unleash`, `supercharge`, `pivotal`.
  - Write concise, active, human interface microcopy.
- **R-02 (Functional Integrity):**
  - No non-functional placeholder elements disguised as functional controls.
  - Every button, dropdown, and tab must either be hooked to real state/actions or clearly marked with interactive feedback.
  - No dead links or dummy `#` anchors.
- **R-03 (Accessibility Semantics & WCAG 2.2):**
  - All interactive elements must meet WCAG AA contrast (minimum 4.5:1 for body text, 3:1 for large text and interactive boundaries).
  - All icon-only buttons must have descriptive `aria-label`s.
  - Focus rings (`focus-visible:ring-2`) must be visible for keyboard navigation.
  - Touch targets on mobile must be at least 44×44px.
- **R-04 (No Code Degradation):**
  - No lazy type escape hatches (`as any`, `@ts-ignore`) without documented external library necessity.
  - No silent failure catch blocks (`catch (e) {}` with no logging or recovery).
  - No redundant obvious comments that describe line-by-line syntax (e.g., `// Increment count by 1`).

---

### Tier 2: Purpose-Gate (Allowed ONLY With Justified Purpose)
*These patterns are not permanently banned, but using them without a stated functional reason is considered AI slop.*

- **R-10 (No Default Blue/Purple Gradients):**
  - Never default to generic indigo-to-purple (`from-indigo-500 to-purple-600`) or cyan hero backgrounds.
  - Colors and gradients must be drawn directly from the project's established palette (e.g., Strawberry, Butter, Cream).
- **R-11 (No Generic Bento Grids / 3-Card Columns):**
  - Avoid defaulting every features section into an identical 3-column card grid with centered emoji or generic Lucide icons.
  - Vary layout cadence based on content hierarchy: lead item, list rows, visual callouts, split details.
- **R-12 (No Arbitrary Glassmorphism / Backdrop Blur):**
  - Do not apply `backdrop-blur-md bg-white/20` to standard cards or containers unless it represents an overlay surface (sticky header, modal backdrop, popover).
- **R-13 (No Gratuitous Floating Badges / Sparkles):**
  - Do not litter headers with "✨ AI Powered", "🚀 New", or floating pill badges unless they signify meaningful live system status.
- **R-14 (No Decorative Over-Rounding):**
  - Avoid stacking `rounded-3xl` or `rounded-full` on everything without size hierarchy. Radii should be proportionate to element scale.

---

### Tier 3: Quality Locks (Consistency & Polish)

- **R-20 (Single Design Token Truth):**
  - Use Tailwind design tokens and project utility classes (e.g., `shadow-cozy`, `font-display`, `bg-[#FFF5F7]`) instead of one-off arbitrary magic numbers.
- **R-21 (Responsive Rhythm):**
  - Ensure layouts gracefully reflow across mobile (`< 768px`), tablet (`768px - 1024px`), and desktop (`≥ 1024px`) without horizontal scrollbars, text clipping, or broken margins.
- **R-22 (Tactile Interactive Feedback):**
  - Buttons, cards, and list items must provide tactile feedback on hover, active/tap, and disabled states (`active:scale-[0.98]`, `transition-all`).

---

## 3. Slop vs. Craft Checklist

| Anti-Slop Target | AI Slop Pattern (Avoid) | Crafted Implementation (Prefer) |
| :--- | :--- | :--- |
| **Color & Theme** | Generic dark mode with indigo/purple neon glow | Cohesive brand palette tailored to project identity (warm pastels & earthy tones) |
| **Cards & Containers** | Borderless white cards with identical huge drop shadows | Subtle borders, warm ambient shadows (`shadow-cozy`), clear visual hierarchy |
| **Icons & Visuals** | Random icons in colored pastel rounded squares | Contextual icons with matching stroke weights and clear semantic meanings |
| **Copy & Tone** | "Experience the next generation of seamless cooking..." | "Save recipes, plan meals, and shop offline." |
| **Empty States** | "No items found" centered in empty gray box | Friendly illustration or warm empty state with an actionable primary CTA |
| **Code Comments** | `// Set state to true` before `setState(true)` | Concise comments explaining *why* non-obvious architecture exists |

---

## 4. Delivery Gate (Pre-Ship Report)

Before finishing any task that touches UI, styling, or copy, run the Delivery Gate check:

```markdown
### 🛡️ Anti-Slop Delivery Gate
- **Purpose Test:** [Passed - All decorative elements serve content hierarchy]
- **Accessibility & Integrity:** [Passed - WCAG AA contrast, 44px tap targets, keyboard focusable]
- **Token & Theme Adherence:** [Passed - Uses project design tokens and responsive breakpoints]
- **Verdict:** [PASS / FAIL]
```
