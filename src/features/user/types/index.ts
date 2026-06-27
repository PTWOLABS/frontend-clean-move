/** Ex.: CUSTOMER; o backend pode devolver outros valores. */
export type UserRole = string;

/** Ex.: GOOGLE; o backend pode devolver outros valores. */
export type SocialAuthProvider = string;

export type UserAddress = {
  street: string;
  complement: string | null;
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
  establishmentId: string | null;
  onboardingCompletedAt: string | null;
  name: string;
  email: string;
  role: UserRole;
  profileImageUrl: string | null;
  phone: string | null;
  address: UserAddress | null;
  socialAccounts: UserSocialAccount[];
  hasPassword: boolean;
  profileComplete: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

/** Corpo de `GET /user/me` e `PATCH /user/me`. */
export type GetCurrentUserResponse = {
  user: User;
};

export type UpdateUserProfileAddressPayload = {
  street: string;
  complement?: string | null;
  country: string;
  state: string;
  zipCode: string;
  city: string;
};

export type UpdateUserProfilePayload = {
  name?: string;
  email?: string;
  phone?: string;
  address?: UpdateUserProfileAddressPayload;
};

export type UploadMediaResponse = {
  url: string;
};

export type UpdateUserPasswordPayload =
  | { newPassword: string }
  | { currentPassword: string; newPassword: string };

export type UpdateUserPasswordResponse = {
  message: string;
};
