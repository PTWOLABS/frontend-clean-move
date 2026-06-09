import z from "zod";

export const requiredText = (field: string) => z.string().trim().min(1, `Informe ${field}.`);
export const optionalText = () => z.string().trim().optional();
