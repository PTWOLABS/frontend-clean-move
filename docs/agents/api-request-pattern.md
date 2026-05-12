# API Request Pattern

This frontend consumes a separate Nest.js backend API.

For regular backend requests, do not use Server Actions by default.

Use this default flow:

```txt
Client Component → TanStack Query → typed API function → httpClient → Nest.js API
```

Avoid this flow unless there is a clear reason:

```txt
Client Component → Server Action → httpClient → Nest.js API
```

Do not add `"use server"` to regular API request files.

---

## API Functions

Create request functions in feature-level `api` files.

Example:

```ts
import { httpClient } from "@/shared/api/httpClient";

import type { AuthUser, LoginPayload, LoginResponse } from "../types";

export async function login(payload: LoginPayload) {
  return httpClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export async function getCurrentUser() {
  return httpClient<AuthUser>("/auth/me");
}
```

API functions should:

- be typed;
- be small;
- use the shared `httpClient`;
- not contain UI logic;
- not call React hooks;
- not duplicate backend business rules.

---

## React Query

Use TanStack React Query for client-side server state.

Use `useQuery` for read operations.

Example:

```ts
import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../api/auth-api";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: getCurrentUser,
  });
}
```

Use `useMutation` for create, update, delete and command-like operations.

Example:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCustomer } from "../api/customers-api";

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers", "list"],
      });
    },
  });
}
```

---

## Query Keys

Use stable and hierarchical query keys.

Good examples:

```ts
["auth", "current-user"];
["customers", "list", filters];
["customers", "detail", customerId];
["appointments", "list", filters];
["appointments", "detail", appointmentId];
["services", "list"];
```

Avoid vague query keys:

```ts
["data"];
["list"];
["items"];
["result"];
```

---

## Invalidation

After successful mutations, invalidate only the affected queries.

Prefer:

```ts
queryClient.invalidateQueries({
  queryKey: ["customers", "list"],
});
```

Avoid invalidating all queries unless strictly necessary.

---

## Server Actions

Use Server Actions only when there is a real Next.js server-side requirement.

Server Actions are allowed when needed for:

- reading or setting HttpOnly cookies in Next.js;
- using server-only environment variables;
- calling private/internal services not reachable by the browser;
- implementing an intentional BFF layer;
- native `<form action={...}>`;
- `useActionState`;
- `redirect`;
- `revalidatePath`;
- `revalidateTag`;
- operations that must run specifically on the Next.js server.

Do not use Server Actions merely to wrap a normal call to the Nest.js API.

Avoid this:

```ts
"use server";

export async function getCustomers() {
  return httpClient("/customers");
}
```

Prefer this:

```ts
export async function getCustomers() {
  return httpClient("/customers");
}
```

---

## Error Handling for Requests

Use the existing error handling pattern in the project.

API errors should be normalized by the shared `httpClient` whenever possible.

Do not silently swallow errors.

Do not expose technical backend errors directly to users unless the project already does so.
