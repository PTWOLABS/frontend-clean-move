/** @vitest-environment node */

import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import type { ServiceItem, ServicesPage } from "../types";

import {
  removeServiceFromLists,
  restoreServicesLists,
  snapshotServicesLists,
  upsertServiceInLists,
} from "./services-query-cache";

const washCategory = { id: "11cf3860-d512-47db-b9d1-c9044be6250d", name: "Lavagem" };

const itemA: ServiceItem = {
  id: "a",
  serviceName: "Lavagem A",
  category: washCategory,
  priceSpecification: { type: "FIXED", fixedPriceInCents: 3000 },
  isActive: true,
};

const itemB: ServiceItem = {
  id: "b",
  serviceName: "Lavagem B",
  category: washCategory,
  priceSpecification: { type: "FIXED", fixedPriceInCents: 5000 },
  isActive: false,
};

const page1: ServicesPage = {
  items: [itemA, itemB],
  total: 2,
  page: 1,
  size: 5,
};

describe("services-query-cache", () => {
  it("removeServiceFromLists removes item and decrements total", () => {
    const client = new QueryClient();
    const key = QUERY_KEYS.services({ page: 1, size: 5 });
    client.setQueryData(key, page1);

    removeServiceFromLists(client, "a");

    expect(client.getQueryData<ServicesPage>(key)).toEqual({
      items: [itemB],
      total: 1,
      page: 1,
      size: 5,
    });
  });

  it("upsertServiceInLists replaces matching item by id", () => {
    const client = new QueryClient();
    const key = QUERY_KEYS.services({ page: 1, size: 5 });
    client.setQueryData(key, page1);

    upsertServiceInLists(client, "b", () => ({
      ...itemB,
      serviceName: "Lavagem B atualizada",
      isActive: true,
    }));

    expect(client.getQueryData<ServicesPage>(key)?.items[1]?.serviceName).toBe(
      "Lavagem B atualizada",
    );
    expect(client.getQueryData<ServicesPage>(key)?.items[1]?.isActive).toBe(true);
  });

  it("restoreServicesLists rolls back to snapshot", () => {
    const client = new QueryClient();
    const key = QUERY_KEYS.services({ page: 1, size: 5 });
    client.setQueryData(key, page1);

    const snapshot = snapshotServicesLists(client);
    removeServiceFromLists(client, "a");
    expect(client.getQueryData<ServicesPage>(key)?.items).toHaveLength(1);

    restoreServicesLists(client, snapshot);
    expect(client.getQueryData<ServicesPage>(key)).toEqual(page1);
  });

  it("ignores service options cache when mutating lists", () => {
    const client = new QueryClient();
    const listKey = QUERY_KEYS.services({ page: 1, size: 5 });
    const optionsKey = QUERY_KEYS.serviceOptions({ limit: 1000 });
    const serviceOptions = {
      services: [{ id: "a", label: "Lavagem A" }],
    };

    client.setQueryData(listKey, page1);
    client.setQueryData(optionsKey, serviceOptions);

    expect(() => removeServiceFromLists(client, "a")).not.toThrow();
    expect(client.getQueryData(optionsKey)).toEqual(serviceOptions);

    client.setQueryData(listKey, page1);

    expect(() =>
      upsertServiceInLists(client, "a", () => ({
        ...itemA,
        serviceName: "Lavagem A atualizada",
      })),
    ).not.toThrow();
    expect(client.getQueryData(optionsKey)).toEqual(serviceOptions);
    expect(client.getQueryData<ServicesPage>(listKey)?.items[0]?.serviceName).toBe(
      "Lavagem A atualizada",
    );
  });
});
