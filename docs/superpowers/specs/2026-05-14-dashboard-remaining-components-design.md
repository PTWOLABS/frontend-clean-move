# Dashboard Remaining Components Design

## Context

The dashboard currently renders the top metric cards through `MetricsSections` and
`MetricsCardList`. The remaining dashboard surface should add three visual
sections below those existing cards:

- revenue and appointments over time;
- cancellation rate;
- popular services.

This scope intentionally ignores the existing four metric cards. It does not
change their data flow, API hook, query key, or behavior.

The implementation will use mocked local data only. It will not add HTTP calls,
React Query hooks, Server Actions, backend contracts, database access, or external
service integrations.

## Existing Project Fit

The project already includes `recharts@2.15.4` and the shadcn chart wrapper in
`src/components/ui/chart.tsx`. That wrapper is already used by
`MetricCardSparkline`, so the new chart cards should follow the same pattern.

The visual language should match the existing metric card treatment:

- `Card` from `src/components/ui/card.tsx`;
- `rounded-2xl`, `border-border/80`, `bg-card/80`, `shadow-card`;
- theme-aware tokens such as `text-card-foreground`, `text-muted-foreground`,
  `text-primary`, `text-success`, `text-danger`, and `bg-muted`;
- dark and light theme compatibility;
- responsive layout inside the existing dashboard grid.

## Architecture

The dashboard section composition will remain feature-local under
`src/features/dashboard`. The new components will be reusable and typed, with data
passed through props. Mock data will live outside components in a dedicated mock
file so it can be removed or replaced by real data later without rewriting the UI.

`MetricsSections` will keep rendering `MetricsCardList` and then mount the three
new components. Because the page currently wraps `MetricsSections` in a
four-column grid, the new cards will use responsive column spans:

- the top metric cards keep their current one-card-per-cell behavior;
- the main revenue chart spans the larger left area on desktop;
- the cancellation card and popular services card occupy the remaining right-side
  area;
- on mobile and tablet, all cards stack cleanly.

No broad page restructure is required for this scope.

## Components

### DashboardPanel

`dashboard-panel.tsx` will provide a small feature-local wrapper for repeated
dashboard card styling. It will not be a global abstraction. Its purpose is to
keep the three new cards visually consistent without duplicating the same long
class list.

Suggested props:

```ts
type DashboardPanelProps = React.ComponentPropsWithoutRef<typeof Card> & {
  title: string;
  description?: string;
  action?: React.ReactNode;
};
```

The panel will render a header row with title, optional description, optional
right-side action, and a content area. Components can still customize layout via
`className` and children.

### RevenueAppointmentsChartCard

This component displays revenue and appointment count in the same card. It will
receive all chart points and summary values by props.

Suggested props:

```ts
type RevenueAppointmentsChartCardProps = {
  data: RevenueAppointmentsPoint[];
  summary: RevenueAppointmentsSummary;
  periodLabel?: string;
  className?: string;
};
```

The chart will use Recharts through `ChartContainer`. The preferred chart is a
two-series `LineChart` or `ComposedChart`, with:

- x-axis labels based on the mocked period labels;
- left y-axis for formatted revenue;
- right y-axis for appointment count;
- tooltip with date, revenue in BRL, and appointments;
- legend matching the visual intent from the reference image;
- a bottom summary band for revenue and appointments in the selected period.

Empty data renders an empty state inside the card instead of an empty chart.

### CancellationRateCard

This component displays the current cancellation rate and target/comparison
metadata. It will receive a single typed data object by props.

Suggested props:

```ts
type CancellationRateCardProps = {
  data: CancellationRateData | null;
  className?: string;
};
```

The preferred visual is a semicircular gauge using Recharts `RadialBarChart`,
because Recharts is already installed and supports radial charts. The gauge logic
must stay encapsulated in this card. If the radial chart becomes brittle during
implementation, the approved fallback is a simpler horizontal progress treatment
with the same content hierarchy: current value, target, comparison, legend, and
empty state.

Empty data renders a clear empty state: no percentage, no chart, and a concise
message that there are no cancellation records for the selected period.

### PopularServicesCard

This component displays the top services from a mocked list. It will receive the
full list and render only the first five items.

Suggested props:

```ts
type PopularServicesCardProps = {
  items: PopularService[];
  periodOptions: DashboardPeriodOption[];
  defaultPeriod: string;
  className?: string;
};
```

The component will show:

- service name;
- completed count;
- percentage relative to the total completed count from the provided list;
- a visual progress bar;
- total completed services at the bottom;
- a period `Select` that is visual/mock-only and does not fetch or mutate data.

Empty data renders an empty state and total `0`.

## Types

Create `src/features/dashboard/types/dashboard-sections.ts`.

Suggested type structure:

```ts
export type RevenueAppointmentsPoint = {
  date: string;
  label: string;
  revenueInCents: number;
  appointments: number;
};

export type RevenueAppointmentsSummary = {
  revenueInCents: number;
  appointments: number;
  revenueTrendPercent: number;
  appointmentsTrendPercent: number;
};

export type CancellationRateData = {
  currentPercent: number;
  targetPercent: number;
  comparisonPercentPoints: number;
};

export type PopularService = {
  id: string;
  name: string;
  completedCount: number;
};

export type DashboardPeriodOption = {
  value: string;
  label: string;
};
```

Formatting helpers can be local to the components unless repeated enough to
justify a small feature-local utility. No shared utility should be added for this
scope unless the implementation clearly needs it.

## Mock Data

Create `src/features/dashboard/mocks/dashboard-sections.mock.ts`.

Suggested exported mocks:

```ts
export const dashboardRevenueAppointmentsMock: RevenueAppointmentsPoint[];
export const dashboardRevenueAppointmentsSummaryMock: RevenueAppointmentsSummary;
export const dashboardCancellationRateMock: CancellationRateData;
export const dashboardPopularServicesMock: PopularService[];
export const dashboardPeriodOptionsMock: DashboardPeriodOption[];
```

The mock values should resemble the reference image enough to validate layout and
hierarchy: one week of dates, revenue around tens of thousands of BRL, appointment
counts around dozens per day, cancellation rate around a low single-digit
percentage, and at least six services so the top-five truncation is exercised.

## Data Flow

The data flow for this phase is:

```txt
dashboard-sections.mock.ts -> MetricsSections -> component props -> presentational UI
```

There are no API requests, query keys, server actions, mutations, or backend
contracts in this flow.

## Error, Empty, And Loading States

Because this phase uses synchronous local mocks, there is no loading state.

Each data-driven card should still handle empty inputs:

- main chart: empty chart area with a muted message;
- cancellation rate: empty state when `data` is `null`;
- popular services: empty list message and total `0`.

There is no runtime request error state because no request is made.

## Accessibility

The chart cards should expose accessible labels through `role="img"` and
`aria-label` on `ChartContainer` where appropriate. Tooltips remain visual
enhancements, not the only source of information.

The popular services progress bars should include accessible text or `aria-label`
describing service name, completed count, and percentage. The period filter should
use the existing accessible shadcn `Select` primitives.

## Testing

Add focused unit tests during implementation for:

- revenue chart card renders title, legend, summary values, and empty state;
- cancellation card renders current percentage, target/comparison metadata, and
  empty state;
- popular services renders only five items, calculates total and percentages, and
  renders empty state.

The implementation should also pass:

```bash
npm run lint
npm run typecheck
```

## Dependencies

No new dependency is needed. Recharts is already installed and sufficient for the
planned charts.

If the Recharts semicircular gauge proves too fragile, the implementation should
use the approved simpler visual fallback instead of installing a new charting
library.

## Risks And Constraints

- Recharts components require client components. The three new chart/list cards
  can be client components without converting the whole dashboard page.
- The existing page grid constrains layout. The new components should use
  responsive `col-span` classes from `MetricsSections` rather than a broad page
  rewrite.
- The radial gauge may require careful sizing on mobile. The fallback is already
  defined to avoid unnecessary complexity.
- Mock data must stay isolated and easy to replace later.
- Existing dashboard API files, hooks, query keys, and the current four metric
  cards are out of scope for this change.

## Implementation Order

1. Add feature-local types.
2. Add feature-local mock data.
3. Add `DashboardPanel`.
4. Add `RevenueAppointmentsChartCard`.
5. Add `CancellationRateCard`.
6. Add `PopularServicesCard`.
7. Mount the three components in `MetricsSections`.
8. Add focused unit tests.
9. Run lint and typecheck.
