export type OptionsDTO = {
  id: string;
  label: string;
}[];

export type CustomerOptionsDTO = {
  customers: OptionsDTO;
  totalItems: number;
};

export type VehicleOptionsDTO = {
  vehicles: OptionsDTO;
  totalItems: number;
};

export type ServiceOptionsDTO = {
  services: Array<{
    id: string;
    label: string;
    priceInCents?: number;
    priceSpecification?:
      | {
          type: "FIXED";
          fixedPriceInCents: number;
        }
      | {
          type: "STARTING_AT";
          minPriceInCents: number;
        }
      | {
          type: "RANGE";
          minPriceInCents: number;
          maxPriceInCents: number;
        };
  }>;
  totalItems: number;
};
