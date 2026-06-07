import { httpClient } from "@/shared/api/httpClient";

import type {
  Establishment,
  GetEstablishmentResponse,
  UpdateEstablishmentPayload,
  UpdateEstablishmentResponse,
} from "../types";

export async function getEstablishment(establishmentId: string): Promise<Establishment> {
  const res = await httpClient<GetEstablishmentResponse>(`/establishments/${establishmentId}`);
  return res.establishment;
}

export async function updateEstablishment(
  establishmentId: string,
  payload: UpdateEstablishmentPayload,
): Promise<Establishment> {
  const res = await httpClient<UpdateEstablishmentResponse>(`/establishments/${establishmentId}`, {
    method: "PATCH",
    body: payload,
  });
  return res.establishment;
}
