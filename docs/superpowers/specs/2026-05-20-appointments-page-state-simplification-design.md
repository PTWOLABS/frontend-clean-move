# Appointments Page State Simplification Design

Date: 2026-05-20
Feature: `appointments` calendar page refactor
Status: approved for planning

## Goal

Remove the `AppointmentsPageContext` and reduce orchestration inside the appointments page while preserving the current behavior and UI.

The target is a simpler ownership model:

- the page keeps only state that is truly shared across multiple children;
- each component owns local UI state that is used only inside that component;
- shared data and actions are passed explicitly through props;
- no new abstraction layer should be introduced unless it removes clear duplication.

## Current Problem

`src/features/appointments/components/appointments-page.tsx` currently centralizes:

- query orchestration;
- calendar navigation state;
- selected date and selected event state;
- visible date range state;
- selected slot state;
- mini calendar state;
- toolbar popover state;
- all cross-component handlers;
- context assembly and provisioning.

This produces two maintainability problems:

1. The page acts as a large coordinator for concerns that belong to specific children.
2. The context hides dependencies, making each child harder to reason about in isolation.

## Non-Goals

- no visual redesign;
- no changes to the API contract;
- no changes to the calendar interaction model unless required by the refactor;
- no new global state solution;
- no extraction of a broad page-level custom hook in this step.

## Design Summary

The context will be removed entirely.

The page will stay as a thin feature container responsible only for:

- loading appointments with `useListAppointments`;
- keeping the shared calendar state;
- deriving shared slices from the loaded events;
- passing props explicitly to presentational/interactive children.

## State Ownership

### State that remains in `appointments-page.tsx`

These values are shared by multiple branches of the UI and should remain at page level:

- `calendarRef`
  - shared by the toolbar and the main calendar.
- `selectedDate`
  - used by calendar selection, agenda list, and both date pickers.
- `selectedEventId`
  - used by the calendar, agenda list, and details card.
- `selectedView`
  - shared by the toolbar and the main calendar.
- `visibleRange`
  - required for request filters and for the period counter in the header.
- `selectedSlotKey`
  - shared between the calendar slot overlay and the page-level selected date behavior.

### State that moves out of `appointments-page.tsx`

These values are local UI concerns and should be owned by the component that uses them:

- `isDatePickerOpen`
  - moves into `appointments-calendar-toolbar.tsx`.
- `miniCalendarMonth`
  - no page-level shared state is needed;
  - each mini calendar owns its own visible month locally.
- toolbar-only navigation handlers
  - become local handlers inside `appointments-calendar-toolbar.tsx`.

## Shared Derived Data

The page will continue deriving the following shared values from the fetched events:

- `selectedEvent`
- `selectedDayAppointments`
- `visibleAppointments`
- `busyDaysInMonth`

These remain at page level because they are consumed by different children and are still cheap, explicit derivations of the page data.

## Component Responsibilities

### `appointments-page.tsx`

Responsibilities:

- build request filters from `visibleRange`;
- call `useListAppointments`;
- keep shared selection state;
- derive shared data slices;
- connect children with explicit props.

Must not:

- own toolbar-only UI state;
- own mini calendar UI state;
- expose children through a feature context.

### `appointments-calendar-toolbar.tsx`

Responsibilities:

- own `isDatePickerOpen`;
- render view switcher and navigation buttons;
- use `calendarRef` to implement `prev`, `next`, `today`, and `changeView`;
- emit selected date changes back to the page.

Inputs:

- `calendarRef`
- `calendarTitle`
- `selectedDate`
- `selectedView`
- `onSelectDate`
- `onChangeView`

### `calendar/appointments-calendar.tsx`

Responsibilities:

- render `FullCalendar`;
- manage its own visual helpers and view mechanics;
- render loading and error states based on props;
- emit selection and range events to the page.

Inputs:

- `calendarRef`
- `events`
- `initialDate`
- `selectedDate`
- `selectedEventId`
- `selectedView`
- `selectedSlotKey`
- `isLoading`
- `isError`
- `onRetry`
- `onSelectSlot`
- `onSelectMonthCell`
- `onSelectEvent`
- `onDatesSet`

### `appointments-quick-navigation-card.tsx`

Responsibilities:

- own the visible month state of the side mini calendar;
- render the quick navigation mini calendar;
- render the busy days summary.

Inputs:

- `selectedDate`
- `busyDaysInMonth`
- `onSelectDate`

### `appointments-day-agenda-card.tsx`

Responsibilities:

- render the selected day agenda;
- render its own loading and error states;
- notify when the user selects an event from the list.

Inputs:

- `selectedDate`
- `selectedEventId`
- `appointments`
- `isLoading`
- `isError`
- `onRetry`
- `onSelectEvent`

### `appointment-details-card.tsx`

Responsibilities:

- render the details of the selected appointment;
- render its own loading and error states.

Inputs:

- `selectedEvent`
- `isLoading`
- `isError`
- `onRetry`

## Data Flow

1. The page computes `startsAt` and `endsAt` from `visibleRange`.
2. `useListAppointments` returns the normalized calendar events.
3. The page derives the current selection and shared slices.
4. The page passes props down to the toolbar, calendar, agenda card, quick navigation card, and details card.
5. User interactions from these children bubble back through explicit callbacks.
6. The page updates the shared state and the affected children re-render from props.

## Error and Loading Handling

- query loading and error state continue to originate from `useListAppointments`;
- the page passes these states down through props;
- each child is responsible only for its own visual representation of those states.

This keeps request state centralized while avoiding UI coupling through context.

## Implementation Notes

- remove `src/features/appointments/contexts/appointments-page-context.tsx`;
- remove all `useAppointmentsPage` imports;
- introduce explicit prop types for each affected component;
- keep the page container readable by grouping prop builders and shared handlers;
- avoid extracting a new page-level hook unless the resulting page still has clear duplication after context removal.

## Risks

### Prop surface growth

Passing props explicitly increases prop lists, especially for the calendar and toolbar.

Mitigation:

- only pass what each child actually uses;
- keep prop names domain-specific and direct;
- prefer a few focused callback props over large generic objects.

### Regressions in selection behavior

Selection is currently coordinated centrally, so the refactor could break:

- auto-selection of the first relevant event;
- slot selection highlight;
- toolbar navigation syncing with the calendar;
- mini calendar date selection.

Mitigation:

- keep shared selection state at page level;
- verify these interactions after refactor;
- preserve the current `FullCalendar` event flow.

## Testing Plan

- run targeted lint on the affected appointments files;
- run `npm run typecheck`;
- run the appointments calendar unit test file;
- manually verify:
  - toolbar navigation;
  - changing view;
  - selecting a calendar event;
  - selecting a day in the mobile date picker;
  - selecting a day in the quick navigation card;
  - agenda click opening the details card;
  - loading and error states still render correctly.

## Expected Outcome

After the refactor:

- the appointments page is a thin container;
- no feature context is required;
- local state lives with the component that uses it;
- shared state remains explicit and limited;
- component dependencies become easier to read, test, and change.
