import { z } from 'zod';

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const requiredText = (field: string) =>
  z.string().trim().min(1, `Informe ${field}.`);

export const accountStepSchema = z.object({
  fullName: requiredText('seu nome completo').min(
    3,
    'Informe seu nome completo.',
  ),
  phone: z
    .string()
    .trim()
    .refine((value) => onlyDigits(value).length >= 10, {
      message: 'Informe um telefone válido.',
    }),
  email: z.email('Informe um e-mail válido.'),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .max(72, 'A senha deve ter no máximo 72 caracteres.'),
});

export const companyStepSchema = z.object({
  cnpj: z
    .string()
    .trim()
    .refine((value) => onlyDigits(value).length === 14, {
      message: 'Informe um CNPJ válido.',
    }),
  legalName: requiredText('a razão social'),
  tradeName: requiredText('o nome fantasia'),
});

export const addressStepSchema = z.object({
  zipCode: z
    .string()
    .trim()
    .refine((value) => onlyDigits(value).length === 8, {
      message: 'Informe um CEP válido.',
    }),
  street: requiredText('a rua'),
  number: requiredText('o número'),
  city: requiredText('a cidade'),
  state: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, 'Informe a UF com 2 letras.'),
  complement: requiredText('o complemento'),
});

export const registerSchema = accountStepSchema
  .extend(companyStepSchema.shape)
  .extend(addressStepSchema.shape);

export type AccountStepValues = z.infer<typeof accountStepSchema>;
export type CompanyStepValues = z.infer<typeof companyStepSchema>;
export type AddressStepValues = z.infer<typeof addressStepSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const registerDefaultValues: RegisterFormValues = {
  fullName: '',
  phone: '',
  email: '',
  password: '',
  cnpj: '',
  legalName: '',
  tradeName: '',
  zipCode: '',
  street: '',
  number: '',
  city: '',
  state: '',
  complement: '',
};
