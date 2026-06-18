const onlyDigits = (value: string) => value.replace(/\D/g, "");

function hasRepeatedDigits(digits: string): boolean {
  return digits.split("").every((digit) => digit === digits[0]);
}

function calculateCheckDigit(digits: string, weights: number[]): number {
  const sum = weights.reduce((acc, weight, index) => acc + Number(digits[index]) * weight, 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== 11 || hasRepeatedDigits(digits)) {
    return false;
  }

  const firstDigit = calculateCheckDigit(digits, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateCheckDigit(
    `${digits.slice(0, 9)}${firstDigit}`,
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return digits.endsWith(`${firstDigit}${secondDigit}`);
}

export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== 14 || hasRepeatedDigits(digits)) {
    return false;
  }

  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstDigit = calculateCheckDigit(digits, firstWeights);
  const secondDigit = calculateCheckDigit(`${digits.slice(0, 12)}${firstDigit}`, secondWeights);

  return digits.endsWith(`${firstDigit}${secondDigit}`);
}

export function isValidCpfCnpj(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length === 11) {
    return isValidCpf(digits);
  }

  if (digits.length === 14) {
    return isValidCnpj(digits);
  }

  return false;
}
