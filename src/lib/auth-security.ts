/**
 * Modul Validasi Keamanan Sandi & Generator OTP Pijar Aksara
 * Aturan Sandi:
 * - Panjang: 8 - 12 karakter
 * - Minimal 1 Huruf Besar (Kapital A-Z)
 * - Minimal 1 Angka Numerik (0-9)
 * - Minimal 1 Tanda Baca / Simbol Khusus (!@#$%^&*...)
 */

export interface PasswordValidationResult {
  hasLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  isValid: boolean;
  score: number; // 0 - 4
  strengthLabel: "Sangat Lemah" | "Lemah" | "Cukup" | "Kuat" | "Sangat Kuat";
  strengthColor: string;
}

export function validatePasswordRules(password: string): PasswordValidationResult {
  const hasLength = password.length >= 8 && password.length <= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  let score = 0;
  if (password.length > 0) {
    if (hasLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    if (hasSymbol) score++;
  }

  let strengthLabel: "Sangat Lemah" | "Lemah" | "Cukup" | "Kuat" | "Sangat Kuat" = "Sangat Lemah";
  let strengthColor = "bg-rose-500 text-rose-600";

  if (score === 1) {
    strengthLabel = "Lemah";
    strengthColor = "bg-orange-500 text-orange-600";
  } else if (score === 2) {
    strengthLabel = "Cukup";
    strengthColor = "bg-amber-500 text-amber-600";
  } else if (score === 3) {
    strengthLabel = "Kuat";
    strengthColor = "bg-blue-500 text-blue-600";
  } else if (score === 4) {
    strengthLabel = "Sangat Kuat";
    strengthColor = "bg-[#58816D] text-[#1F382B]";
  }

  return {
    hasLength,
    hasUppercase,
    hasNumber,
    hasSymbol,
    isValid: hasLength && hasUppercase && hasNumber && hasSymbol,
    score,
    strengthLabel,
    strengthColor,
  };
}

/**
 * Membuat kode OTP 6-digit acak
 */
export function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
