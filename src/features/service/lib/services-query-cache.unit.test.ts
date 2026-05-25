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

const itemA: ServiceItem = {
  id: "a",
  serviceName: "Lavagem A",
  category: "WASH",
  isActive: true,
};

const itemB: ServiceItem = {
  id: "b",
  serviceName: "Lavagem B",
  category: "WASH",
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
});
