import { httpClient } from "@/shared/api/httpClient";

export async function deleteCustomer(customerId: string) {
  return httpClient<null>(`/customers/${customerId}`, {
    method: "DELETE",
  });
}
