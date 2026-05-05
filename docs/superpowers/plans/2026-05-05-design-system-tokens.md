# Design System Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure Tailwind and shadcn to use the CleanMove design tokens from `design.json`.

**Architecture:** Treat `src/app/globals.css` as the runtime token source for Tailwind 4 and shadcn CSS variables. Keep `tailwind.config.ts` aligned for shadcn tooling and editor support. Update only the existing primitive components needed to consume the new tokens.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn-style components, next-themes.

---

### Task 1: Token Foundation

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] Replace default shadcn HSL values with CleanMove light and dark values from `design.json`.
- [ ] Add `@theme inline` mappings for Tailwind 4 color, font, radius, shadow, spacing, and motion utility classes.
- [ ] Keep shadcn-compatible token names and add CleanMove-specific sidebar and status aliases.

### Task 2: shadcn Setup

**Files:**
- Create: `components.json`

- [ ] Configure shadcn aliases to match the current project: `@/components/ui` and `@/shared/utils/cn`.
- [ ] Enable CSS variables and the `new-york` style so future generated primitives use the token layer.

### Task 3: Primitive Components

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/theme-toggle.tsx`
- Modify: `src/app/layout.tsx`

- [ ] Update Button sizing, radius, focus, hover, active, disabled, and loading state styling.
- [ ] Update Input height, radius, border, placeholder, focus, disabled, and invalid states.
- [ ] Remove emoji structural icons from the theme toggle.
- [ ] Update layout metadata, language, and body font token usage.

### Task 4: Verification

**Files:**
- Read: `package.json`

- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Report any existing or environment-specific failure with exact command output.
