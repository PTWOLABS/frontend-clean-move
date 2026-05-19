# Dashboard Toolbar Date Range Design

## Context

The dashboard page currently renders the page title and subtitle in
`src/app/(private)/dashboard/page.tsx` and delegates the metric content to
`src/features/dashboard/components/metrics-sessions.tsx`.

`MetricsSections` now includes `DatePickerWithRange`, but the picker is broken
for this use case because it still behaves like a generic form field:

- it renders `Field` and `FieldLabel`;
- it uses English copy;
- it has a rigid narrow width;
- it does not visually fit a dashboard toolbar;
- it is not ready to receive shared filter state from `MetricsSections`.

The goal of this scope is to keep the shared date filter inside
`MetricsSections`, make the top area visually closer to the provided reference,
and prepare the filter state to be passed to child dashboard components later.

This scope does not wire the date range into API hooks yet. It only fixes the
composition, component API, and local state ownership.

## Existing Project Fit

The current page structure already has the correct top-level responsibility split:

- `page.tsx` owns the page title and subtitle;
- `MetricsSections` owns the dashboard body.

The recommended change is to preserve that split and introduce a feature-local
toolbar at the top of `MetricsSections`, instead of moving all page header
content into the feature component.

The implementation should follow the existing dashboard visual language:

- theme-aware surfaces using `bg-card`, `bg-muted`, `border-border`, and text
  tokens;
- compact rounded controls with subtle borders;
- mobile-first responsive layout;
- `lucide-react` icons;
- shadcn `Popover`, `Button`, and `Calendar`.

## Architecture

### `page.tsx`

`src/app/(private)/dashboard/page.tsx` remains responsible for the page-level
header:

- title;
- subtitle.

No filter state is introduced at the page level in this scope.

### `MetricsSections`

`src/features/dashboard/components/metrics-sessions.tsx` becomes the owner of the
shared dashboard date range state. It will:

- initialize a local `DateRange`;
- render a toolbar above the metrics grid;
- pass the current range and setter to `DatePickerWithRange`;
- keep the grid composition of dashboard cards below the toolbar.

This is the correct ownership boundary for future shared dashboard filters,
because all metric cards already live under `MetricsSections`.

### `DatePickerWithRange`

`src/components/calendar/date-picker-with-range.tsx` will be refactored from an
internal-state-only form field into a reusable date range control that supports
both controlled and uncontrolled usage.

The component will:

- accept `value`;
- accept `onChange`;
- keep internal fallback state when `value` is omitted;
- expose `className`;
- expose a Portuguese `placeholder`;
- expose popover alignment configuration suitable for toolbar usage.

The component remains generic and reusable, but its default presentation should
work well for the dashboard toolbar.

## Visual Design

### Toolbar Layout

The top area inside `MetricsSections` will become a responsive toolbar with two
zones:

1. left-side context block;
2. right-side filter controls.

Suggested behavior:

- mobile: stack vertically with `gap-3` or `gap-4`;
- `md+`: switch to a horizontal row with `items-center` and
  `justify-between`;
- allow the date picker to align to the right on desktop without breaking small
  screens.

### Left-Side Context Block

This block should visually complement the existing page subtitle without
duplicating the same text verbatim. It should contain:

- a short label or sentence that indicates this is the dashboard overview;
- a small status indicator similar to the reference image;
- concise copy in Portuguese.

Example direction:

- muted descriptive line;
- green status dot;
- text such as `Tudo funcionando bem`.

This keeps the page visually closer to the reference while respecting the
existing split where `page.tsx` already renders the main title and subtitle.

### Right-Side Date Control

The date picker trigger should look like a toolbar control rather than a form
field:

- compact height;
- rounded border;
- left calendar icon;
- selected range text in Portuguese;
- right chevron icon;
- no visible field label;
- no English copy.

The trigger should remain keyboard accessible and preserve the existing shadcn
popover behavior.

The button shown in the reference image for `Novo agendamento` is out of scope.
This toolbar may keep space for future actions, but no new action button is
added in this task.

## Component API

### `DatePickerWithRange`

Suggested API:

```ts
type DatePickerWithRangeProps = {
  value?: DateRange;
  onChange?: (value: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
  align?: "start" | "center" | "end";
};
```

Behavior rules:

- when `value` is provided, the component is controlled;
- when `value` is omitted, the component manages its own local range;
- `onChange` is always called when the user selects a new range;
- the trigger text shows:
  - full range when `from` and `to` exist;
  - only the initial date when only `from` exists;
  - the placeholder when neither exists.

Formatting should use Portuguese date output and avoid the current English month
format.

### `MetricsSections`

No external props are required yet. Internally it should:

- hold a single `DateRange` state;
- pass it to `DatePickerWithRange`;
- keep child dashboard cards mounted exactly where they already are.

This allows future filter propagation without another structural refactor.

## Data Flow

The data flow for this scope is intentionally local:

1. `MetricsSections` owns the current `DateRange`;
2. `DatePickerWithRange` renders that state and updates it through `onChange`;
3. no current dashboard card consumes the range yet;
4. future cards/hooks may receive normalized date filters from `MetricsSections`.

This keeps the current task focused and avoids premature coupling to fetch logic.

## Responsiveness

Requirements:

- toolbar stacks cleanly on mobile;
- date picker remains readable on smaller widths;
- toolbar aligns horizontally on desktop;
- existing metrics grid remains unchanged below the toolbar;
- no fixed desktop-only widths that cause overflow.

The calendar popover should remain usable on smaller screens. If two months feel
too cramped in the current calendar implementation, the implementation may reduce
to one month on small screens while keeping two months on wider screens.

## Accessibility

Requirements:

- the date picker trigger remains a real button;
- the selected date range is readable to assistive technologies;
- icons are decorative unless they add meaning;
- the status indicator must not rely on color alone;
- keyboard navigation and popover focus behavior must remain intact.

Removing the visible `FieldLabel` is acceptable for this toolbar use case because
the selected range text and button semantics provide the necessary context.

## Out of Scope

This task does not:

- connect the date range to React Query hooks;
- add backend filters or request transformations;
- introduce a new action button;
- move the page title/subtitle out of `page.tsx`;
- redesign the metric cards or lower dashboard sections.

## Validation

Implementation should validate:

- `MetricsSections` renders a stable toolbar above the grid;
- `DatePickerWithRange` works in controlled mode;
- `DatePickerWithRange` still works in uncontrolled mode;
- the trigger text is correctly localized in Portuguese;
- the layout remains usable on mobile and desktop;
- lint and type checks pass for the touched files.
