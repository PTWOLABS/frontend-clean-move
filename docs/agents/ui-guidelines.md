# UI Guidelines

Always respect the existing design system.

Do not create a new visual language unless explicitly requested.

Follow the existing:

- colors;
- spacing;
- border radius;
- typography;
- shadows;
- layout patterns;
- component variants;
- icon style;
- empty states;
- loading states;
- error states.

Do not introduce colors, shadows, gradients or visual styles that conflict with the current design.

---

## Responsiveness

When implementing or changing UI, make it responsive when applicable.

Use mobile-first Tailwind classes.

Consider common breakpoints:

```txt
sm
md
lg
xl
2xl
```

Make sure layouts work well on:

- mobile;
- tablet;
- desktop;
- wide screens.

Avoid fixed widths that break on small screens.

Prefer responsive patterns such as:

```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
```

or:

```tsx
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
```

---

## shadcn/ui

Reuse existing shadcn/ui components whenever possible.

Prefer existing components such as:

- Button;
- Input;
- Textarea;
- Select;
- Dialog;
- Sheet;
- DropdownMenu;
- Card;
- Badge;
- Tabs;
- Table;
- Form;
- Alert;
- Separator;
- Skeleton;
- Tooltip;
- Popover;
- Calendar;
- Command.

Do not create custom versions of components that already exist in shadcn/ui unless there is a strong reason.

If a needed shadcn/ui component is not installed, suggest or add it only when necessary.

Example:

```bash
npx shadcn@latest add dialog
```

Use the existing project convention for installing shadcn components.

---

## Styling Guidelines

Use Tailwind CSS following the project's existing conventions.

Prefer readable class composition.

Avoid large unreadable class strings when a component can be split.

Use utility classes consistently.

Do not use arbitrary values unless necessary.

Prefer design tokens, CSS variables or existing theme values when available.

Avoid inline styles unless there is a strong reason.

---

## Icons

Use the existing icon library used by the project.

If the project uses `lucide-react`, prefer it.

Keep icon usage consistent:

- similar stroke width;
- similar size;
- meaningful visual purpose;
- no excessive decorative icons.
