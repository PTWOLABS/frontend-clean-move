export type OptionsQuery = {
  size?: number;
  search?: string;
};

/** Params enviados ao GET /options, incluindo `page` (pageParam do infinite query). */
export type OptionsListParams = OptionsQuery & {
  page?: number;
};
