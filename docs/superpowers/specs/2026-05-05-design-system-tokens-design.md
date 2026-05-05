# CleanMove Design System Tokens

## Goal

Configure the technical design foundation for the internal CleanMove SaaS UI before building application screens.

## Source Of Truth

`design.json` defines the brand direction, light and dark themes, semantic colors, spacing, radii, shadows, component primitives, sidebar styling, typography stacks, motion timing, and accessibility requirements.

## Approved Scope

- Replace generic shadcn color variables in `src/app/globals.css` with CleanMove semantic tokens.
- Keep the design system compatible with shadcn naming: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, and `ring`.
- Add application tokens requested by the prompt: `sidebar-background`, `sidebar-foreground`, `sidebar-active`, `success`, `warning`, `danger`, and `info`.
- Expose tokens to Tailwind 4 through `@theme inline` and keep `tailwind.config.ts` aligned for shadcn tooling.
- Add `components.json` so future shadcn components can be generated consistently.
- Update existing `Button`, `Input`, and theme toggle styling to use the design system primitives.

## Non-Goals

- No backend changes.
- No business-rule changes.
- No new domain screens in this step.
- No dependency install in this step.

## Design Direction

The internal app should feel like a premium operational SaaS for automotive aesthetics: deep forest navigation, warm ivory application background, white or warm elevated surfaces, champagne/gold accents, subtle borders, restrained shadows, strong focus states, and clear status colors.

## Validation

Run TypeScript checks and build after implementation. If build is blocked by existing project or environment issues, capture the exact failure.
