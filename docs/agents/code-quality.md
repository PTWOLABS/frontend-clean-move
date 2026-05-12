# Code Quality Guidelines

## TypeScript

Use TypeScript carefully and explicitly.

Prefer:

- typed function inputs;
- typed API responses;
- domain-specific types;
- inferred types from Zod schemas when useful;
- discriminated unions when appropriate.

Avoid:

- `any`;
- unnecessary type assertions;
- overly generic types;
- duplicating types unnecessarily;
- unsafe casts.

If a type already exists, reuse it.

Do not create duplicate types with different names for the same concept.

---

## Loading, Empty and Error States

When implementing data-driven UI, include appropriate states.

Use existing components such as:

- Skeleton;
- Alert;
- Card;
- EmptyState component if available;
- Button loading state if available.

A list page should usually handle:

- loading;
- empty result;
- error;
- data loaded.

UI should show clear feedback for:

- loading;
- empty states;
- validation errors;
- request errors;
- permission errors;
- success states.

---

## Accessibility

Follow basic accessibility practices:

- use semantic HTML;
- use buttons for actions;
- use links for navigation;
- provide labels for form fields;
- do not remove focus styles without replacement;
- ensure keyboard navigation works;
- ensure dialogs and dropdowns use accessible components;
- use readable contrast;
- avoid relying only on color to communicate state.

---

## File and Folder Organization

Follow the existing project structure.

Prefer feature-based organization when the project already follows it.

Example:

```txt
features/
  auth/
    api/
    components/
    hooks/
    schemas/
    types/
  customers/
    api/
    components/
    hooks/
    schemas/
    types/
```

Shared reusable components should go into the shared components directory used by the project.

Do not place feature-specific components in global shared folders.

Do not create new architectural patterns if an existing one is already present.

---

## Performance

Avoid unnecessary client-side rendering.

Avoid unnecessary state.

Avoid unnecessary effects.

Do not use `useEffect` for derived state when it can be computed directly.

Avoid unnecessary memoization.

Use `useMemo` and `useCallback` only when there is a clear benefit.

Prefer Server Components for static and server-rendered UI.
