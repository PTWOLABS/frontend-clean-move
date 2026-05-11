# CleanMove Private Navigation Sidebar

## Goal

Create the primary navigation for the authenticated CleanMove app using a grouped sidebar. The menu should make the main operational areas easy to reach without listing every detail, creation, or edit route as a permanent global item.

## Approved Direction

Use a sidebar grouped by work routine:

- Operação: Dashboard, Agenda, Agendamentos, PDV.
- Cadastros: Clientes, Veículos, Serviços.
- Gestão: Orçamentos, Relatórios, Configurações.

PDV should be expandable in the sidebar and expose:

- Venda / caixa: `/pos`.
- Movimentações: `/pos/movements`.
- Fechamento: `/pos/closing`.

Creation, detail, and edit routes should stay out of the fixed sidebar. They should be reached from page-level actions, links, breadcrumbs, or tables inside their parent module:

- `/appointments/new`
- `/appointments/:id`
- `/customers/new`
- `/customers/:id`
- `/customers/:id/edit`
- `/budgets/new`
- `/budgets/:id`
- `/budgets/:id/edit`

## Navigation Map

| Label | Route | Group | Sidebar behavior |
| --- | --- | --- | --- |
| Dashboard | `/dashboard` | Operação | Top-level item |
| Agenda | `/agenda` | Operação | Top-level item |
| Agendamentos | `/appointments` | Operação | Top-level item |
| PDV | `/pos` | Operação | Expandable parent |
| Movimentações | `/pos/movements` | PDV | Nested item |
| Fechamento | `/pos/closing` | PDV | Nested item |
| Clientes | `/customers` | Cadastros | Top-level item |
| Veículos | `/vehicles` | Cadastros | Top-level item |
| Serviços | `/services` | Cadastros | Top-level item |
| Orçamentos | `/budgets` | Gestão | Top-level item |
| Relatórios | `/reports` | Gestão | Top-level item |
| Configurações | `/settings` | Gestão | Top-level item |

## Architecture

The authenticated route group should continue using `src/app/(private)/layout.tsx` with `AppShell`. `AppShell` should become the private application frame and wrap children with the existing shadcn sidebar primitives from `src/components/ui/sidebar.tsx`.

The navigation UI should live in a focused component, for example `src/components/app-sidebar.tsx`, while `src/components/app-shell.tsx` composes providers, sidebar, top header, and page content. The sidebar can be a Client Component because it needs the current pathname and expandable state for PDV. The page content should remain Server Component friendly; do not turn private pages into Client Components just for navigation.

## UI Behavior

Desktop should show the sidebar by default with grouped labels and lucide icons. The sidebar may be collapsible using the existing shadcn sidebar trigger, preserving tooltip behavior for collapsed icon-only navigation.

Mobile should use the existing sidebar Sheet behavior from `SidebarProvider` and `SidebarTrigger`, so navigation remains reachable without consuming the full viewport.

The header should keep the CleanMove identity and existing theme toggle. The main content should preserve the current constrained page spacing and use theme-aware tokens such as `bg-background`, `bg-sidebar`, `text-sidebar-foreground`, `border-sidebar-border`, and `bg-sidebar-accent`.

All visible Portuguese navigation labels must use correct accents.

Active states should be derived from the current pathname. Parent modules should remain active for nested routes, so `/customers/123/edit` highlights Clientes and `/pos/closing` highlights PDV plus Fechamento.

## Data Flow

The sidebar is static configuration: labels, hrefs, icons, groups, and optional children. It does not fetch API data and does not introduce React Query hooks or Server Actions.

## Error Handling

The navigation itself has no remote failure state. Route-level errors, loading states, and empty states remain the responsibility of each page or feature module.

## Accessibility

Use semantic links for navigation and buttons only for toggling the sidebar or expanding PDV. Labels must remain available to screen readers when the sidebar is collapsed. Keyboard users must be able to tab through menu items and toggle PDV.

## Testing And Validation

Implementation should be validated with:

- TypeScript check.
- Lint check.
- Existing unit tests if impacted.
- Manual responsive check for desktop and mobile widths.
- Manual active-state check for parent, nested, creation, detail, and edit routes.

## Non-Goals

- No backend changes.
- No permission-based menu filtering in this step.
- No implementation of the destination pages beyond navigation access.
- No new dependencies.
- No business rules in the frontend.
