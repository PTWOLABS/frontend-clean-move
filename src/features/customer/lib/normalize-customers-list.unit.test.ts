import { describe, expect, it } from "vitest";

import { normalizeCustomersList } from "./normalize-customers-list";

describe("normalizeCustomersList", () => {
  it("maps customers and totalItems to CustomersPage", () => {
    const result = normalizeCustomersList(
      {
        customers: [{ id: "c1" } as never],
        totalItems: 42,
      },
      2,
      10,
    );

    expect(result).toEqual({
      items: [{ id: "c1" }],
      total: 42,
      page: 2,
      size: 10,
    });
  });

  it("returns empty page when body is null", () => {
    expect(normalizeCustomersList(null, 1, 10)).toEqual({
      items: [],
      total: 0,
      page: 1,
      size: 10,
    });
  });
});
