# Appointment Snapshot Editing Design

## Context

Appointments keep historical snapshots for customer, vehicle, and services. Editing a customer, vehicle, or service later must not silently rewrite existing appointments in the UI.

Today, the appointment edit form loads snapshot data, but selected services can be synchronized with current service options after the form opens. That can change price metadata and trigger validation errors even when the user has not changed the appointment.

## Goals

- Opening an existing appointment for edit must show the saved snapshot values with zero initial validation errors.
- Service prices from the appointment snapshot must not be recalculated from the current service catalog.
- A historical service price must stay read-only while that snapshot service remains selected.
- Current catalog data must be applied only when the user explicitly removes/replaces a service.
- Option lists must show fresh customer, vehicle, and service labels when searching/selecting current resources.
- Mutations for customer, vehicle, and service should not invalidate appointment queries, because existing appointments render historical data.

## Non-Goals

- Do not add frontend business rules that decide whether an appointment is valid after catalog changes.
- Do not refetch or mutate existing appointments after customer, vehicle, or service edits.
- Do not implement full "resource changed/deleted" badges until the backend exposes enough current-resource state.

## Data Model

The frontend keeps using the current appointment snapshot:

- customer snapshot: `customerId` and display label from the appointment payload.
- vehicle snapshot: `vehicleId` and display label from the appointment payload.
- service snapshot: service id, label, and `priceInCents` from the appointment payload.

For a future richer UI, the backend should return current resource state separately from the snapshot, for example:

- current resource `updatedAt`;
- current resource `deletedAt`;
- or a normalized state such as `ACTIVE`, `UPDATED`, `DELETED`.

Those fields should not mutate the snapshot itself. They only inform UI warnings and replacement actions.

## Form Behavior

In edit mode:

- Initial values are built from the appointment snapshot.
- Selected snapshot services keep their snapshot label and price.
- Snapshot service price inputs are disabled.
- The form does not synchronize snapshot service metadata with `serviceOptions`.
- Validation should not compare snapshot service prices against current catalog minimum, maximum, or fixed-price rules.
- Removing a snapshot service removes that historical row.
- Selecting a service from the option list creates a current-catalog service row with current label, price metadata, and current validation rules.

In create mode:

- Service selection continues to use current catalog options.
- Service prices continue to initialize and validate from current service metadata.

## Option Lists

Customer, vehicle, and service option queries remain responsible for current selectable resources.

When merging selected options with fetched options:

- a selected snapshot can be shown while it is selected;
- fetched current options must not be hidden behind stale labels when the user searches/reselects;
- after replacement, the current option label should win.

## Query Invalidation

Service mutations should invalidate service list and service option queries.

Customer and vehicle mutations should invalidate their own list and option queries where applicable.

Customer, vehicle, and service mutations should not invalidate appointment queries, because appointment lists and calendars are expected to render historical appointment snapshots.

Appointment mutations continue to invalidate appointment queries and affected metric queries.

## Error Handling

Opening edit mode must not create validation errors caused by catalog drift.

If the backend rejects an update because a referenced resource can no longer be used, the existing mutation error feedback should be shown. The frontend should not preemptively invent backend domain decisions.

## Tests

Add or update unit tests for:

- edit form opens with snapshot service price when current catalog metadata changed;
- snapshot service price input is disabled;
- saving an unrelated edit does not submit service changes caused by current catalog metadata;
- removing and reselecting a service uses current catalog label and price metadata;
- option merge behavior allows current labels to appear during replacement.
