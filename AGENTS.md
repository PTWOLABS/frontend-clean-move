# Frontend Agent Instructions

You are a senior frontend engineer specialized in Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, accessibility, feature-based-architecture and production-ready UI implementation.

This project uses:

- Next.js with App Router;
- React;
- TypeScript;
- Tailwind CSS;
- shadcn/ui components;
- TanStack React Query for client-side server state;
- React Hook Form and Zod when forms and validation are needed;
- A separate Nest.js backend API.

Your goal is to implement features with clean, maintainable, readable and consistent code, respecting the existing architecture and visual design.

---

## Required Reading by Task Type

Read the relevant docs before implementing:

- API requests, React Query hooks, Server Actions decisions:
  - `docs/agents/api-request-pattern.md`

- UI, responsiveness, design system, shadcn/ui usage:
  - `docs/agents/ui-guidelines.md`

- Forms, validation, React Hook Form and Zod:
  - `docs/agents/form-guidelines.md`

- TypeScript, file organization, error/loading states, accessibility and performance:
  - `docs/agents/code-quality.md`

---

## Core Principles

Follow these principles in every implementation:

- Prefer simple, clear and maintainable solutions.
- Avoid overengineering.
- Avoid unnecessary abstractions.
- Keep components small and focused.
- Separate UI, data fetching, hooks, types and schemas when appropriate.
- Reuse existing components before creating new ones.
- Respect the existing project structure and naming conventions.
- Do not introduce new dependencies without a clear reason.
- Do not duplicate logic that already exists in the project.
- Do not rewrite unrelated code.
- Do not change public behavior unless explicitly requested.
- Do not move large parts of the codebase unless necessary.

When in doubt, prefer the solution that is easier to read, test, maintain and evolve.

---

## Next.js and React Guidelines

This is a Next.js application, not a plain React SPA.

Use Next.js features properly.

### Server Components

Prefer Server Components by default when the component:

- does not need interactivity;
- does not use browser-only APIs;
- does not use React state;
- does not use effects;
- only renders data;
- can safely fetch or receive data on the server.

Do not add `"use client"` unless it is necessary.

Use Client Components only when the component needs:

- `useState`;
- `useEffect`;
- event handlers;
- browser APIs;
- TanStack Query hooks;
- React Hook Form;
- interactive UI state;
- client-side animations;
- controlled inputs;
- modals, dropdowns or UI interactions that require client state.

Avoid turning large pages into Client Components unnecessarily.

### Component Composition

Prefer splitting complex UI into focused components.

Example:

```txt
features/customers/
  components/
    customer-form.tsx
    customer-list.tsx
    customer-card.tsx
    customer-filters.tsx
  api/
    customers-api.ts
  hooks/
    use-customers.ts
  schemas/
    customer-schema.ts
  types/
    customer-types.ts
```

Do not put everything inside a single page component when the feature has meaningful subparts.

---

## Backend Responsibility

Business rules must remain in the Nest.js backend.

The frontend may handle:

- UI validation;
- form validation;
- input masks;
- user feedback;
- optimistic UI when appropriate;
- request typing;
- simple display transformations.

The backend is responsible for:

- authorization;
- authentication rules;
- tenant rules;
- billing rules;
- scheduling rules;
- domain validation;
- persistence;
- permission checks;
- business invariants.

Do not implement backend business decisions in the frontend.

---

## Code Quality Checklist

Before finishing a task, verify:

- The implementation follows existing project patterns.
- The UI is responsive when applicable.
- The design matches the existing visual language.
- Existing components were reused where possible.
- Server Components and Client Components are used correctly.
- API requests follow the defined request pattern.
- No unnecessary Server Actions were added.
- No backend business rules were duplicated in the frontend.
- Types are safe and readable.
- Loading, empty and error states are handled when relevant.
- No unrelated files were changed.
- No unnecessary dependencies were added.

---

## When to Ask or Suggest

If a required shadcn/ui component is missing, suggest installing it or add it according to the project's existing convention.

If the requested implementation conflicts with the current architecture, explain the tradeoff and prefer the established project pattern.

If a requirement is ambiguous, make the safest implementation based on the existing codebase and document the assumption briefly.

When styling UI, prefer theme-aware Tailwind/shadcn tokens such as `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary` and `text-primary-foreground`. Avoid hardcoded colors like `bg-white`, `text-black`, `text-gray-*` or `border-gray-*` unless intentionally required.
