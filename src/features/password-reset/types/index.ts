export type PasswordResetMessageResponse = {
  message: string;
};

export type RequestPasswordResetPayload = {
  email: string;
};

export type ConfirmPasswordResetPayload = {
  token: string;
  newPassword: string;
};
