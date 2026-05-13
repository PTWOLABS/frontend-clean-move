/** Ex.: CUSTOMER; o backend pode devolver outros valores. */
export type UserRole = string;

/** Ex.: GOOGLE; o backend pode devolver outros valores. */
export type SocialAuthProvider = string;

export type UserAddress = {
  street: string;
  complement: string;
  country: string;
  state: string;
  zipCode: string;
  city: string;
};

export type UserSocialAccount = {
  provider: SocialAuthProvider;
  subjectId: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: UserAddress;
  socialAccounts: UserSocialAccount[];
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Corpo de `GET /user/me`. */
export type GetCurrentUserResponse = {
  user: User;
};
