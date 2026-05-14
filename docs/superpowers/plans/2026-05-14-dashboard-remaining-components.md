# Dashboard Remaining Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the remaining dashboard sections for revenue/appointments, cancellation rate, and popular services using isolated mocked data only.

**Architecture:** Keep the implementation inside `src/features/dashboard`, with typed mocks passed through `MetricsSections` into reusable presentational components. Use the existing shadcn `Card`, shadcn chart wrapper, Recharts, Tailwind tokens, and responsive column spans from the dashboard grid.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Vitest, Testing Library.

---

## File Structure

- Create: `src/features/dashboard/types/dashboard-sections.ts`
  - Owns feature-local types for the three new dashboard sections.
- Create: `src/features/dashboard/mocks/dashboard-sections.mock.ts`
  - Owns synchronous mock data for the three new dashboard sections.
- Create: `src/features/dashboard/components/dashboard-panel.tsx`
  - Owns the repeated dashboard card shell used only by these new sections.
- Create: `src/features/dashboard/components/revenue-appointments-chart-card.tsx`
  - Owns the main revenue and appointments chart card.
- Create: `src/features/dashboard/components/revenue-appointments-chart-card.unit.test.tsx`
  - Verifies the main chart card text, summary, chart label, and empty state.
- Create: `src/features/dashboard/components/cancellation-rate-card.tsx`
  - Owns the cancellation rate gauge card and its empty state.
- Create: `src/features/dashboard/components/cancellation-rate-card.unit.test.tsx`
  - Verifies cancellation value, target/comparison metadata, chart label, and empty state.
- Create: `src/features/dashboard/components/popular-services-card.tsx`
  - Owns the popular services list, visual period select, top-five limit, percentages, and total.
- Create: `src/features/dashboard/components/popular-services-card.unit.test.tsx`
  - Verifies top-five rendering, percentage calculation, total, visual filter, and empty state.
- Modify: `src/features/dashboard/components/metrics-sessions.tsx`
  - Mounts the three new components below `MetricsCardList` using the mock data.

No API files, hooks, query keys, backend contracts, global tokens, or existing metric card behavior should change.

---

### Task 1: Add Dashboard Section Types And Mock Data

**Files:**
- Create: `src/features/dashboard/types/dashboard-sections.ts`
- Create: `src/features/dashboard/mocks/dashboard-sections.mock.ts`

- [ ] **Step 1: Create the dashboard section types**

Create `src/features/dashboard/types/dashboard-sections.ts` with this content:

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

- [ ] **Step 2: Create the typed mock data**

Create `src/features/dashboard/mocks/dashboard-sections.mock.ts` with this content:

```ts
import type {
  CancellationRateData,
  DashboardPeriodOption,
  PopularService,
  RevenueAppointmentsPoint,
  RevenueAppointmentsSummary,
} from "@/features/dashboard/types/dashboard-sections";

export const dashboardRevenueAppointmentsMock: RevenueAppointmentsPoint[] = [
  {
    date: "20/05/2024",
    label: "20/05",
    revenueInCents: 545000,
    appointments: 31,
  },
  {
    date: "21/05/2024",
    label: "21/05",
    revenueInCents: 790000,
    appointments: 45,
  },
  {
    date: "22/05/2024",
    label: "22/05",
    revenueInCents: 670000,
    appointments: 36,
  },
  {
    date: "23/05/2024",
    label: "23/05",
    revenueInCents: 985000,
    appointments: 42,
  },
  {
    date: "24/05/2024",
    label: "24/05",
    revenueInCents: 590000,
    appointments: 29,
  },
  {
    date: "25/05/2024",
    label: "25/05",
    revenueInCents: 786000,
    appointments: 39,
  },
  {
    date: "26/05/2024",
    label: "26/05",
    revenueInCents: 372900,
    appointments: 34,
  },
];

export const dashboardRevenueAppointmentsSummaryMock: RevenueAppointmentsSummary = {
  revenueInCents: 4738900,
  appointments: 256,
  revenueTrendPercent: 21,
  appointmentsTrendPercent: 18,
};

export const dashboardCancellationRateMock: CancellationRateData = {
  currentPercent: 4.2,
  targetPercent: 5.8,
  comparisonPercentPoints: -1.6,
};

export const dashboardPopularServicesMock: PopularService[] = [
  {
    id: "full-wash",
    name: "Lavagem Completa",
    completedCount: 128,
  },
  {
    id: "interior-cleaning",
    name: "Higienização Interna",
    completedCount: 86,
  },
  {
    id: "polishing",
    name: "Polimento",
    completedCount: 46,
  },
  {
    id: "crystallization",
    name: "Cristalização",
    completedCount: 28,
  },
  {
    id: "waxing",
    name: "Enceramento",
    completedCount: 16,
  },
  {
    id: "paint-protection",
    name: "Vitrificação",
    completedCount: 11,
  },
];

export const dashboardPeriodOptionsMock: DashboardPeriodOption[] = [
  {
    value: "this-month",
    label: "Este mês",
  },
  {
    value: "last-7-days",
    label: "Últimos 7 dias",
  },
  {
    value: "last-30-days",
    label: "Últimos 30 dias",
  },
];
```

- [ ] **Step 3: Run typecheck for the new types and mocks**

Run:

```bash
npm run typecheck
```

Expected: PASS. These files should not reference browser APIs, React, Recharts, API clients, React Query, or server actions.

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/types/dashboard-sections.ts src/features/dashboard/mocks/dashboard-sections.mock.ts
git commit -m "feat: add dashboard section mocks"
```

---

### Task 2: Add The Dashboard Panel Shell

**Files:**
- Create: `src/features/dashboard/components/dashboard-panel.tsx`

- [ ] **Step 1: Create the dashboard panel component**

Create `src/features/dashboard/components/dashboard-panel.tsx` with this content:

```tsx
import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/shared/utils/cn";

export type DashboardPanelProps = Omit<
  React.ComponentPropsWithoutRef<typeof Card>,
  "children" | "title"
> & {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
};

const DashboardPanel = React.forwardRef<HTMLDivElement, DashboardPanelProps>(
  (
    { title, description, action, children, className, contentClassName, ...props },
    ref,
  ) => (
    <Card
      ref={ref}
      className={cn(
        "relative h-full overflow-hidden rounded-2xl border-border/80 bg-card/80 p-4 shadow-card backdrop-blur-sm sm:p-5",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold leading-none text-card-foreground">{title}</h3>
          {description ? (
            <p className="text-xs leading-5 text-muted-foreground">{description}</p>
          ) : null}
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className={cn("mt-5", contentClassName)}>{children}</div>
    </Card>
  ),
);
DashboardPanel.displayName = "DashboardPanel";

export { DashboardPanel };
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS. The component should be a Server Component-compatible component because it has no hooks, effects, event handlers, browser APIs, or chart code.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/components/dashboard-panel.tsx
git commit -m "feat: add dashboard panel shell"
```

---

### Task 3: Add The Revenue And Appointments Chart Card

**Files:**
- Create: `src/features/dashboard/components/revenue-appointments-chart-card.tsx`
- Create: `src/features/dashboard/components/revenue-appointments-chart-card.unit.test.tsx`

- [ ] **Step 1: Write the failing unit test**

Create `src/features/dashboard/components/revenue-appointments-chart-card.unit.test.tsx` with this content:

```tsx
import { render, screen } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  dashboardRevenueAppointmentsMock,
  dashboardRevenueAppointmentsSummaryMock,
} from "@/features/dashboard/mocks/dashboard-sections.mock";

type MockChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: unknown;
  children: React.ReactNode;
};

vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children, config: _config, ...props }: MockChartContainerProps) => (
    <div data-testid="chart-container" {...props}>
      {children}
    </div>
  ),
  ChartTooltip: () => <div data-testid="chart-tooltip" />,
}));

vi.mock("recharts", () => ({
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Line: () => <div data-testid="line" />,
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
}));

import { RevenueAppointmentsChartCard } from "./revenue-appointments-chart-card";

describe("RevenueAppointmentsChartCard", () => {
  it("renders title, legend, chart label, and period summary", () => {
    render(
      <RevenueAppointmentsChartCard
        data={dashboardRevenueAppointmentsMock}
        summary={dashboardRevenueAppointmentsSummaryMock}
        periodLabel="Diário"
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: /receita e agendamentos ao longo do tempo/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Diário")).toBeInTheDocument();
    expect(screen.getByText("Receita (R$)")).toBeInTheDocument();
    expect(screen.getByText("Agendamentos")).toBeInTheDocument();
    expect(screen.getByTestId("chart-container")).toHaveAttribute(
      "aria-label",
      "Gráfico de receita e agendamentos ao longo do tempo",
    );
    expect(screen.getByText("Receita no período")).toBeInTheDocument();
    expect(screen.getByText(/47\.389,00/)).toBeInTheDocument();
    expect(screen.getByText("Agendamentos no período")).toBeInTheDocument();
    expect(screen.getByText("256")).toBeInTheDocument();
    expect(screen.getByText("+21%")).toBeInTheDocument();
    expect(screen.getByText("+18%")).toBeInTheDocument();
  });

  it("renders an empty state when there is no chart data", () => {
    render(
      <RevenueAppointmentsChartCard
        data={[]}
        summary={dashboardRevenueAppointmentsSummaryMock}
      />,
    );

    expect(
      screen.getByText("Sem dados de receita e agendamentos para o período."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the unit test to verify it fails**

Run:

```bash
npm run test:run -- src/features/dashboard/components/revenue-appointments-chart-card.unit.test.tsx
```

Expected: FAIL because `./revenue-appointments-chart-card` does not exist.

- [ ] **Step 3: Implement the chart card**

Create `src/features/dashboard/components/revenue-appointments-chart-card.tsx` with this content:

```tsx
"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type {
  RevenueAppointmentsPoint,
  RevenueAppointmentsSummary,
} from "@/features/dashboard/types/dashboard-sections";
import { cn } from "@/shared/utils/cn";

import { DashboardPanel } from "./dashboard-panel";

type RevenueAppointmentsChartCardProps = {
  data: RevenueAppointmentsPoint[];
  summary: RevenueAppointmentsSummary;
  periodLabel?: string;
  className?: string;
};

type RevenueTooltipPayload = {
  color?: string;
  dataKey?: string | number;
  value?: number | string;
  payload?: RevenueAppointmentsPoint;
};

type RevenueTooltipProps = {
  active?: boolean;
  payload?: RevenueTooltipPayload[];
};

const chartConfig = {
  revenueInCents: {
    label: "Receita (R$)",
    color: "hsl(var(--primary))",
  },
  appointments: {
    label: "Agendamentos",
    color: "hsl(var(--success))",
  },
} satisfies ChartConfig;

function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
}

function formatCompactCurrency(valueInCents: number) {
  return `R$ ${Math.round(valueInCents / 100000)}k`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatTrend(value: number) {
  const formattedValue = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(value);

  return `${value > 0 ? "+" : ""}${formattedValue}%`;
}

function RevenueAppointmentsTooltip({ active, payload }: RevenueTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;

  return (
    <div className="grid min-w-44 gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-xs shadow-xl">
      {point?.date ? <p className="font-medium text-foreground">{point.date}</p> : null}

      <div className="grid gap-1.5">
        {payload.map((item) => {
          const itemKey = String(item.dataKey ?? "");
          const isRevenue = itemKey === "revenueInCents";
          const label = isRevenue ? "Receita" : "Agendamentos";
          const value =
            typeof item.value === "number"
              ? isRevenue
                ? formatCurrency(item.value)
                : formatNumber(item.value)
              : item.value;

          return (
            <div key={itemKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {label}
              </span>
              <span className="font-medium tabular-nums text-foreground">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: number;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="font-display text-xl font-semibold leading-none text-card-foreground">
          {value}
        </p>
        <span
          className={cn(
            "text-xs font-semibold",
            trend >= 0 ? "text-success" : "text-danger",
          )}
        >
          {formatTrend(trend)}
        </span>
      </div>
    </div>
  );
}

export function RevenueAppointmentsChartCard({
  data,
  summary,
  periodLabel = "Diário",
  className,
}: RevenueAppointmentsChartCardProps) {
  return (
    <DashboardPanel
      title="Receita e agendamentos ao longo do tempo"
      className={className}
      action={
        <span className="inline-flex h-8 items-center rounded-lg border border-border/80 bg-muted/30 px-3 text-xs font-medium text-muted-foreground">
          {periodLabel}
        </span>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
          Receita (R$)
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2 rounded-full bg-success" />
          Agendamentos
        </span>
      </div>

      {data.length ? (
        <ChartContainer
          config={chartConfig}
          role="img"
          aria-label="Gráfico de receita e agendamentos ao longo do tempo"
          className="h-72 w-full aspect-auto"
        >
          <LineChart accessibilityLayer data={data} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="revenue"
              width={56}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCompactCurrency}
            />
            <YAxis
              yAxisId="appointments"
              orientation="right"
              width={32}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 4" }}
              content={<RevenueAppointmentsTooltip />}
            />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenueInCents"
              stroke="var(--color-revenueInCents)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--color-revenueInCents)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              yAxisId="appointments"
              type="monotone"
              dataKey="appointments"
              stroke="var(--color-appointments)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--color-appointments)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      ) : (
        <div className="flex min-h-72 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          Sem dados de receita e agendamentos para o período.
        </div>
      )}

      <div className="mt-4 grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 sm:grid-cols-2">
        <SummaryMetric
          label="Receita no período"
          value={formatCurrency(summary.revenueInCents)}
          trend={summary.revenueTrendPercent}
        />
        <SummaryMetric
          label="Agendamentos no período"
          value={formatNumber(summary.appointments)}
          trend={summary.appointmentsTrendPercent}
        />
      </div>
    </DashboardPanel>
  );
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run:

```bash
npm run test:run -- src/features/dashboard/components/revenue-appointments-chart-card.unit.test.tsx
```

Expected: PASS. The test should confirm that the component renders the title, legend labels, accessible chart label, summary values, trends, and empty state.

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard/components/revenue-appointments-chart-card.tsx src/features/dashboard/components/revenue-appointments-chart-card.unit.test.tsx
git commit -m "feat: add revenue appointments chart card"
```

---

### Task 4: Add The Cancellation Rate Card

**Files:**
- Create: `src/features/dashboard/components/cancellation-rate-card.tsx`
- Create: `src/features/dashboard/components/cancellation-rate-card.unit.test.tsx`

- [ ] **Step 1: Write the failing unit test**

Create `src/features/dashboard/components/cancellation-rate-card.unit.test.tsx` with this content:

```tsx
import { render, screen } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { dashboardCancellationRateMock } from "@/features/dashboard/mocks/dashboard-sections.mock";

type MockChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: unknown;
  children: React.ReactNode;
};

vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children, config: _config, ...props }: MockChartContainerProps) => (
    <div data-testid="chart-container" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("recharts", () => ({
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  RadialBar: () => <div data-testid="radial-bar" />,
  RadialBarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radial-bar-chart">{children}</div>
  ),
}));

import { CancellationRateCard } from "./cancellation-rate-card";

describe("CancellationRateCard", () => {
  it("renders the current rate, target, comparison, and chart label", () => {
    render(<CancellationRateCard data={dashboardCancellationRateMock} />);

    expect(
      screen.getByRole("heading", { name: /taxa de cancelamento/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("4,2%")).toBeInTheDocument();
    expect(screen.getByText("Cancelamentos")).toBeInTheDocument();
    expect(screen.getByText("Atual")).toBeInTheDocument();
    expect(screen.getByText("5,8%")).toBeInTheDocument();
    expect(screen.getByText("Meta")).toBeInTheDocument();
    expect(screen.getByText("1,6 p.p. abaixo da meta")).toBeInTheDocument();
    expect(screen.getByTestId("chart-container")).toHaveAttribute(
      "aria-label",
      "Taxa de cancelamento atual de 4,2%",
    );
  });

  it("renders an empty state when cancellation data is missing", () => {
    render(<CancellationRateCard data={null} />);

    expect(
      screen.getByText("Sem dados de cancelamento para o período."),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("radial-bar-chart")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the unit test to verify it fails**

Run:

```bash
npm run test:run -- src/features/dashboard/components/cancellation-rate-card.unit.test.tsx
```

Expected: FAIL because `./cancellation-rate-card` does not exist.

- [ ] **Step 3: Implement the cancellation rate card**

Create `src/features/dashboard/components/cancellation-rate-card.tsx` with this content:

```tsx
"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import type { CancellationRateData } from "@/features/dashboard/types/dashboard-sections";
import { cn } from "@/shared/utils/cn";

import { DashboardPanel } from "./dashboard-panel";

type CancellationRateCardProps = {
  data: CancellationRateData | null;
  className?: string;
};

const chartConfig = {
  current: {
    label: "Atual",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function formatPercentPoints(value: number) {
  return `${new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value))} p.p.`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function CancellationRateCard({ data, className }: CancellationRateCardProps) {
  if (!data) {
    return (
      <DashboardPanel title="Taxa de cancelamento" className={className}>
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          Sem dados de cancelamento para o período.
        </div>
      </DashboardPanel>
    );
  }

  const gaugeValue =
    data.targetPercent > 0 ? clamp((data.currentPercent / data.targetPercent) * 100, 0, 100) : 0;
  const comparisonIsGood = data.comparisonPercentPoints <= 0;
  const comparisonLabel = `${formatPercentPoints(data.comparisonPercentPoints)} ${
    comparisonIsGood ? "abaixo" : "acima"
  } da meta`;
  const currentPercent = formatPercent(data.currentPercent);
  const targetPercent = formatPercent(data.targetPercent);

  return (
    <DashboardPanel title="Taxa de cancelamento" className={className}>
      <div className="relative mx-auto h-40 w-full max-w-72">
        <ChartContainer
          config={chartConfig}
          role="img"
          aria-label={`Taxa de cancelamento atual de ${currentPercent}`}
          className="h-full w-full aspect-auto"
        >
          <RadialBarChart
            data={[{ name: "Atual", value: gaugeValue }]}
            startAngle={180}
            endAngle={0}
            innerRadius="72%"
            outerRadius="100%"
            barSize={16}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="value"
              background
              cornerRadius={16}
              fill="var(--color-current)"
              isAnimationActive={false}
            />
          </RadialBarChart>
        </ChartContainer>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center text-center">
          <p className="font-display text-3xl font-semibold leading-none text-card-foreground">
            {currentPercent}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Cancelamentos</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
          <span className="font-medium text-card-foreground">{currentPercent}</span>
          Atual
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="font-medium text-card-foreground">{targetPercent}</span>
          Meta
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-center">
        <p
          className={cn(
            "text-xs font-semibold",
            comparisonIsGood ? "text-success" : "text-danger",
          )}
        >
          {comparisonLabel}
        </p>
      </div>
    </DashboardPanel>
  );
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run:

```bash
npm run test:run -- src/features/dashboard/components/cancellation-rate-card.unit.test.tsx
```

Expected: PASS. The test should confirm that the component renders the current percentage, target, comparison label, accessible chart label, and empty state.

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard/components/cancellation-rate-card.tsx src/features/dashboard/components/cancellation-rate-card.unit.test.tsx
git commit -m "feat: add cancellation rate card"
```

---

### Task 5: Add The Popular Services Card

**Files:**
- Create: `src/features/dashboard/components/popular-services-card.tsx`
- Create: `src/features/dashboard/components/popular-services-card.unit.test.tsx`

- [ ] **Step 1: Write the failing unit test**

Create `src/features/dashboard/components/popular-services-card.unit.test.tsx` with this content:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  dashboardPeriodOptionsMock,
  dashboardPopularServicesMock,
} from "@/features/dashboard/mocks/dashboard-sections.mock";

import { PopularServicesCard } from "./popular-services-card";

describe("PopularServicesCard", () => {
  it("renders only the top five services with percentages and total", () => {
    render(
      <PopularServicesCard
        items={dashboardPopularServicesMock}
        periodOptions={dashboardPeriodOptionsMock}
        defaultPeriod="this-month"
      />,
    );

    expect(screen.getByRole("heading", { name: /serviços populares/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Este mês");
    expect(screen.getByText("Lavagem Completa")).toBeInTheDocument();
    expect(screen.getByText("Higienização Interna")).toBeInTheDocument();
    expect(screen.getByText("Polimento")).toBeInTheDocument();
    expect(screen.getByText("Cristalização")).toBeInTheDocument();
    expect(screen.getByText("Enceramento")).toBeInTheDocument();
    expect(screen.queryByText("Vitrificação")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/lavagem completa: 128 serviços, 41% do total/i)).toBeInTheDocument();
    expect(screen.getByText("Total de serviços")).toBeInTheDocument();
    expect(screen.getByText("315")).toBeInTheDocument();
  });

  it("renders an empty state and zero total when there are no services", () => {
    render(
      <PopularServicesCard
        items={[]}
        periodOptions={dashboardPeriodOptionsMock}
        defaultPeriod="this-month"
      />,
    );

    expect(screen.getByText("Nenhum serviço realizado no período.")).toBeInTheDocument();
    expect(screen.getByText("Total de serviços")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the unit test to verify it fails**

Run:

```bash
npm run test:run -- src/features/dashboard/components/popular-services-card.unit.test.tsx
```

Expected: FAIL because `./popular-services-card` does not exist.

- [ ] **Step 3: Implement the popular services card**

Create `src/features/dashboard/components/popular-services-card.tsx` with this content:

```tsx
"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  DashboardPeriodOption,
  PopularService,
} from "@/features/dashboard/types/dashboard-sections";

import { DashboardPanel } from "./dashboard-panel";

type PopularServicesCardProps = {
  items: PopularService[];
  periodOptions: DashboardPeriodOption[];
  defaultPeriod: string;
  className?: string;
};

const MAX_VISIBLE_SERVICES = 5;

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function getPercentage(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function PopularServicesCard({
  items,
  periodOptions,
  defaultPeriod,
  className,
}: PopularServicesCardProps) {
  const [period, setPeriod] = React.useState(defaultPeriod);
  const selectedPeriod = periodOptions.some((option) => option.value === period)
    ? period
    : periodOptions[0]?.value;
  const totalServices = items.reduce((total, item) => total + item.completedCount, 0);
  const visibleServices = items.slice(0, MAX_VISIBLE_SERVICES);

  return (
    <DashboardPanel
      title="Serviços populares"
      className={className}
      action={
        periodOptions.length ? (
          <Select value={selectedPeriod} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 w-32 border-border/80 bg-muted/30 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null
      }
    >
      {visibleServices.length ? (
        <div className="space-y-4">
          {visibleServices.map((service) => {
            const percentage = getPercentage(service.completedCount, totalServices);

            return (
              <div key={service.id} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <p className="min-w-0 truncate font-medium text-card-foreground">
                    {service.name}
                  </p>
                  <div className="flex shrink-0 items-center gap-3 text-xs tabular-nums">
                    <span className="font-semibold text-card-foreground">
                      {formatNumber(service.completedCount)}
                    </span>
                    <span className="w-9 text-right text-muted-foreground">{percentage}%</span>
                  </div>
                </div>
                <div
                  aria-label={`${service.name}: ${formatNumber(
                    service.completedCount,
                  )} serviços, ${percentage}% do total`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={percentage}
                  className="h-2 rounded-full bg-muted"
                  role="progressbar"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          Nenhum serviço realizado no período.
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
        <p className="text-sm text-muted-foreground">Total de serviços</p>
        <p className="font-display text-xl font-semibold text-card-foreground">
          {formatNumber(totalServices)}
        </p>
      </div>
    </DashboardPanel>
  );
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run:

```bash
npm run test:run -- src/features/dashboard/components/popular-services-card.unit.test.tsx
```

Expected: PASS. The test should confirm that the component renders only five services, calculates percentages from the full list total, shows the visual period select, and handles empty data.

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard/components/popular-services-card.tsx src/features/dashboard/components/popular-services-card.unit.test.tsx
git commit -m "feat: add popular services card"
```

---

### Task 6: Mount The New Cards In MetricsSections

**Files:**
- Modify: `src/features/dashboard/components/metrics-sessions.tsx`

- [ ] **Step 1: Replace `metrics-sessions.tsx` with the new composition**

Update `src/features/dashboard/components/metrics-sessions.tsx` to this content:

```tsx
import {
  dashboardCancellationRateMock,
  dashboardPeriodOptionsMock,
  dashboardPopularServicesMock,
  dashboardRevenueAppointmentsMock,
  dashboardRevenueAppointmentsSummaryMock,
} from "@/features/dashboard/mocks/dashboard-sections.mock";

import { CancellationRateCard } from "./cancellation-rate-card";
import { MetricsCardList } from "./metric-cards-list";
import { PopularServicesCard } from "./popular-services-card";
import { RevenueAppointmentsChartCard } from "./revenue-appointments-chart-card";

export function MetricsSections() {
  return (
    <>
      <MetricsCardList />

      <RevenueAppointmentsChartCard
        className="md:col-span-2 lg:col-span-2"
        data={dashboardRevenueAppointmentsMock}
        summary={dashboardRevenueAppointmentsSummaryMock}
        periodLabel="Diário"
      />

      <CancellationRateCard
        className="md:col-span-1 lg:col-span-1"
        data={dashboardCancellationRateMock}
      />

      <PopularServicesCard
        className="md:col-span-1 lg:col-span-1"
        defaultPeriod="this-month"
        items={dashboardPopularServicesMock}
        periodOptions={dashboardPeriodOptionsMock}
      />
    </>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS. `MetricsSections` should still avoid API calls and should only pass local mocks into the new presentational components.

- [ ] **Step 3: Run all dashboard component tests**

Run:

```bash
npm run test:run -- src/features/dashboard/components/revenue-appointments-chart-card.unit.test.tsx src/features/dashboard/components/cancellation-rate-card.unit.test.tsx src/features/dashboard/components/popular-services-card.unit.test.tsx
```

Expected: PASS. The three new component test files should pass together.

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/components/metrics-sessions.tsx
git commit -m "feat: mount dashboard remaining components"
```

---

### Task 7: Final Verification

**Files:**
- Verify only; no file edits expected.

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS. Fix only lint issues introduced by the dashboard component files from this plan.

- [ ] **Step 2: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS. No new API, hook, or query key types should be introduced.

- [ ] **Step 3: Run the focused tests**

Run:

```bash
npm run test:run -- src/features/dashboard/components/revenue-appointments-chart-card.unit.test.tsx src/features/dashboard/components/cancellation-rate-card.unit.test.tsx src/features/dashboard/components/popular-services-card.unit.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Inspect changed files**

Run:

```bash
git diff --stat
git diff -- src/features/dashboard
```

Expected: the diff should be limited to the dashboard feature files listed in this plan. It should not include changes to `src/features/dashboard/api`, `src/features/dashboard/hooks`, `src/shared/constants/query-keys.ts`, backend contracts, package files, or design token files.

- [ ] **Step 5: Commit verification fixes if any were required**

If lint, typecheck, or tests required a small correction, commit those corrections:

```bash
git add src/features/dashboard
git commit -m "fix: polish dashboard remaining components"
```

Expected: skip this commit when Step 1 through Step 4 pass without additional edits.

---

## Self-Review Notes

- Spec coverage: the plan adds the main revenue/appointments chart, cancellation rate card, popular services card, typed mocks, empty states, responsive mounting, and focused tests.
- Scope check: the plan does not modify API request files, React Query hooks, query keys, backend contracts, package dependencies, or the existing four metric cards.
- Dependency check: the plan uses existing `recharts` and existing shadcn/ui components only.
- Type consistency: the prop names in component tasks match the types from Task 1 and the mock exports from Task 1.
