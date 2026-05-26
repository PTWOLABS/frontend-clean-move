export type OptionsDTO = {
  id: string;
  label: string;
}[];

export type CustomerOptionsDTO = {
  customers: OptionsDTO;
};

export type VehicleOptionsDTO = {
  vehicles: OptionsDTO;
};
