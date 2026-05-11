# Form Guidelines

Use React Hook Form and Zod when implementing complex forms.

Prefer schema-driven validation.

Example structure:

```txt
features/customers/
  schemas/
    customer-schema.ts
  components/
    customer-form.tsx
```

Form validation should improve UX, but it must not replace backend validation.

Use existing form components and patterns from the project.

Prefer clear error messages.

---

## Accessibility

Keep forms accessible:

- labels connected to inputs;
- helpful validation messages;
- disabled state during submission;
- loading state when submitting;
- keyboard-friendly interactions.

---

## Submission

Use TanStack React Query mutations for form submissions that call the Nest.js backend.

Use Server Actions only when there is a real Next.js server-side requirement, as described in `docs/agents/api-request-pattern.md`.

---

## Validation Responsibility

The frontend may handle:

- required fields;
- format validation;
- masks;
- immediate UI feedback;
- basic input constraints.

The backend remains responsible for:

- authorization;
- domain validation;
- tenant rules;
- permission checks;
- business invariants;
- persistence.
