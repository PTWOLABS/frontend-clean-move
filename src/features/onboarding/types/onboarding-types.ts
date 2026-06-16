export type OnboardingDTO = {
  onboarding: {
    establishmentUpdated: boolean;
    serviceCreated: boolean;
    customerCreated: boolean;
    vehicleCreated: boolean;
    appointmentCreated: boolean;
  };
};

export type OnboardingPayload = {
  establishment?: {
    tradeName?: string;
    legalBusinessName?: string;
    cnpj?: string;
  };
  service?: {
    serviceName: string;
    categoryId?: string;
    description?: string;
    estimatedDuration?: {
      minInMinutes: number;
      maxInMinutes?: number;
    };
    price: number;
    isActive: boolean;
  };
  customer?: {
    fullName: string;
    phone: string;
    email?: string | null;
  };
  vehicle?: {
    plate: string | null;
    model: string | null;
    color?: string | null;
  };
  appointment?: {
    startsAt: string;
    endsAt?: string | null;
  };
};
