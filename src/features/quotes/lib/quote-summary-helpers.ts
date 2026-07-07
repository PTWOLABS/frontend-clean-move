import { CreateQuoteFormInput } from "../types/create-quote";

const paymentMethodLabels = {
  CASH: "Dinheiro",
  PIX: "Pix",
  CARD: "Cartão",
  OTHER: "Outro",
} satisfies Record<CreateQuoteFormInput["stepThree"]["paymentOptions"][number]["method"], string>;

export function getDisplayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "Não informado";
  return String(value).trim() || "Não informado";
}

export function getCustomerDescription(stepOne: CreateQuoteFormInput["stepOne"]) {
  return stepOne.customerId ? "Cliente selecionado do cadastro." : "Cliente informado manualmente.";
}

export function getContactLabel(customer: CreateQuoteFormInput["stepOne"]["customer"]) {
  const phone = getDisplayValue(customer.phone);
  const email = getDisplayValue(customer.email);

  if (phone !== "Não informado") return phone;
  return email;
}

export function getVehicleDescription(stepOne: CreateQuoteFormInput["stepOne"]) {
  return stepOne.vehicleId ? "Veículo selecionado do cadastro." : "Veículo informado manualmente.";
}

export function getServiceLabel(service: CreateQuoteFormInput["stepTwo"]["services"][number]) {
  return service.serviceLabel || service.serviceName || "Serviço sem nome";
}

export function getServicesTotalInCents(services: CreateQuoteFormInput["stepTwo"]["services"]) {
  return services.reduce((total, service) => {
    if (service.isCourtesy) return total;
    return total + getFiniteNumber(service.priceInCents);
  }, 0);
}

export function getPaymentDiscountInCents(
  paymentOption: CreateQuoteFormInput["stepThree"]["paymentOptions"][number],
  servicesTotalInCents: number,
) {
  if (!paymentOption.discountType) return 0;
  const discountValue = getFiniteNumber(paymentOption.discountValue);
  if (discountValue <= 0) return 0;

  if (paymentOption.discountType === "PERCENTAGE") {
    return Math.round((servicesTotalInCents * discountValue) / 100);
  }

  return discountValue;
}

export function getPaymentDetails(
  paymentOption: CreateQuoteFormInput["stepThree"]["paymentOptions"][number],
) {
  const method = paymentMethodLabels[paymentOption.method];

  if (paymentOption.method !== "CARD") return method;

  const installments = getFiniteNumber(paymentOption.installments) || 1;
  const interestLabel = paymentOption.interestFree ? "sem juros" : "com juros";

  return `${method} em ${installments}x ${interestLabel}`;
}

export function getFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
