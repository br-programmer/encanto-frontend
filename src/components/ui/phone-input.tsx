"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Country {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
  /** Regex to validate the LOCAL number (without country code) */
  localPattern: RegExp;
  /** Error message when validation fails */
  localError: string;
  /** Placeholder for the local number */
  localPlaceholder: string;
}

const COUNTRIES: Country[] = [
  { code: "EC", dialCode: "+593", flag: "🇪🇨", name: "Ecuador", localPattern: /^9\d{8}$/, localError: "Debe empezar con 9 y tener 9 dígitos", localPlaceholder: "9XX XXX XXXX" },
  { code: "US", dialCode: "+1", flag: "🇺🇸", name: "Estados Unidos", localPattern: /^\d{10}$/, localError: "Debe tener 10 dígitos", localPlaceholder: "XXX XXX XXXX" },
  { code: "CO", dialCode: "+57", flag: "🇨🇴", name: "Colombia", localPattern: /^3\d{9}$/, localError: "Debe empezar con 3 y tener 10 dígitos", localPlaceholder: "3XX XXX XXXX" },
  { code: "PE", dialCode: "+51", flag: "🇵🇪", name: "Perú", localPattern: /^9\d{8}$/, localError: "Debe empezar con 9 y tener 9 dígitos", localPlaceholder: "9XX XXX XXX" },
  { code: "MX", dialCode: "+52", flag: "🇲🇽", name: "México", localPattern: /^\d{10}$/, localError: "Debe tener 10 dígitos", localPlaceholder: "XXX XXX XXXX" },
  { code: "ES", dialCode: "+34", flag: "🇪🇸", name: "España", localPattern: /^[6-9]\d{8}$/, localError: "Debe empezar con 6-9 y tener 9 dígitos", localPlaceholder: "6XX XXX XXX" },
  { code: "AR", dialCode: "+54", flag: "🇦🇷", name: "Argentina", localPattern: /^\d{10}$/, localError: "Debe tener 10 dígitos", localPlaceholder: "XX XXXX XXXX" },
  { code: "CL", dialCode: "+56", flag: "🇨🇱", name: "Chile", localPattern: /^9\d{8}$/, localError: "Debe empezar con 9 y tener 9 dígitos", localPlaceholder: "9XX XXX XXX" },
  { code: "BR", dialCode: "+55", flag: "🇧🇷", name: "Brasil", localPattern: /^\d{10,11}$/, localError: "Debe tener 10 u 11 dígitos", localPlaceholder: "XX XXXXX XXXX" },
  { code: "VE", dialCode: "+58", flag: "🇻🇪", name: "Venezuela", localPattern: /^4\d{9}$/, localError: "Debe empezar con 4 y tener 10 dígitos", localPlaceholder: "4XX XXX XXXX" },
  { code: "PA", dialCode: "+507", flag: "🇵🇦", name: "Panamá", localPattern: /^6\d{7}$/, localError: "Debe empezar con 6 y tener 8 dígitos", localPlaceholder: "6XXX XXXX" },
  { code: "CR", dialCode: "+506", flag: "🇨🇷", name: "Costa Rica", localPattern: /^\d{8}$/, localError: "Debe tener 8 dígitos", localPlaceholder: "XXXX XXXX" },
  { code: "BO", dialCode: "+591", flag: "🇧🇴", name: "Bolivia", localPattern: /^[67]\d{7}$/, localError: "Debe empezar con 6 o 7 y tener 8 dígitos", localPlaceholder: "7XXX XXXX" },
  { code: "UY", dialCode: "+598", flag: "🇺🇾", name: "Uruguay", localPattern: /^9\d{7}$/, localError: "Debe empezar con 9 y tener 8 dígitos", localPlaceholder: "9X XXX XXX" },
  { code: "PY", dialCode: "+595", flag: "🇵🇾", name: "Paraguay", localPattern: /^9\d{8}$/, localError: "Debe empezar con 9 y tener 9 dígitos", localPlaceholder: "9XX XXX XXX" },
  { code: "DO", dialCode: "+1", flag: "🇩🇴", name: "Rep. Dominicana", localPattern: /^\d{10}$/, localError: "Debe tener 10 dígitos", localPlaceholder: "XXX XXX XXXX" },
  { code: "GT", dialCode: "+502", flag: "🇬🇹", name: "Guatemala", localPattern: /^\d{8}$/, localError: "Debe tener 8 dígitos", localPlaceholder: "XXXX XXXX" },
  { code: "HN", dialCode: "+504", flag: "🇭🇳", name: "Honduras", localPattern: /^[389]\d{7}$/, localError: "Debe empezar con 3, 8 o 9 y tener 8 dígitos", localPlaceholder: "9XXX XXXX" },
  { code: "SV", dialCode: "+503", flag: "🇸🇻", name: "El Salvador", localPattern: /^[267]\d{7}$/, localError: "Debe empezar con 2, 6 o 7 y tener 8 dígitos", localPlaceholder: "7XXX XXXX" },
  { code: "NI", dialCode: "+505", flag: "🇳🇮", name: "Nicaragua", localPattern: /^[578]\d{7}$/, localError: "Debe empezar con 5, 7 u 8 y tener 8 dígitos", localPlaceholder: "8XXX XXXX" },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultCountry?: string;
}

export function PhoneInput({
  value,
  onChange,
  id,
  name,
  placeholder,
  defaultCountry = "EC",
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    () => COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0]
  );
  const [localNumber, setLocalNumber] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Parse initial value to extract country code and local number
  useEffect(() => {
    if (initialized.current || !value) return;
    initialized.current = true;

    if (value.startsWith("+")) {
      const match = COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (match) {
        setSelectedCountry(match);
        setLocalNumber(value.slice(match.dialCode.length));
        return;
      }
    }
    const digits = value.replace(/\D/g, "");
    setLocalNumber(digits.startsWith("0") ? digits.slice(1) : digits);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const validate = (number: string, country: Country) => {
    if (!number) {
      setError(null);
      return;
    }
    if (!country.localPattern.test(number)) {
      setError(country.localError);
    } else {
      setError(null);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setLocalNumber(digits);
    onChange(`${selectedCountry.dialCode}${digits}`);
    if (touched) validate(digits, selectedCountry);
  };

  const handleBlur = () => {
    setTouched(true);
    validate(localNumber, selectedCountry);
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    onChange(`${country.dialCode}${localNumber}`);
    if (touched) validate(localNumber, country);
  };

  return (
    <div>
      <div className="relative flex" ref={dropdownRef}>
        {/* Country selector */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-1 px-2.5 sm:px-3 border border-r-0 rounded-l-md bg-secondary/30 hover:bg-secondary/50 transition-colors text-sm flex-shrink-0",
            isOpen && "bg-secondary/50",
            touched && error ? "border-destructive" : "border-border"
          )}
        >
          <span className="text-base">{selectedCountry.flag}</span>
          <span className="text-foreground-secondary text-xs sm:text-sm">{selectedCountry.dialCode}</span>
          <ChevronDown className="h-3 w-3 text-foreground-muted" />
        </button>

        {/* Phone input */}
        <input
          type="tel"
          id={id}
          name={name}
          value={localNumber}
          onChange={handleNumberChange}
          onBlur={handleBlur}
          placeholder={placeholder || selectedCountry.localPlaceholder}
          className={cn(
            "flex-1 min-w-0 h-10 sm:h-11 px-3 border rounded-r-md bg-background text-sm outline-none focus:ring-2 transition-colors",
            touched && error
              ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
              : "border-border focus:ring-primary/20 focus:border-primary"
          )}
        />

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 max-h-60 overflow-y-auto bg-background border border-border rounded-md shadow-lg z-50">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-secondary/50 transition-colors",
                  selectedCountry.code === country.code && "bg-secondary/30"
                )}
              >
                <span className="text-base">{country.flag}</span>
                <span className="flex-1 text-left">{country.name}</span>
                <span className="text-foreground-secondary text-xs">{country.dialCode}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {touched && error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

/**
 * Validate a phone number against its country pattern.
 * Returns true if valid or empty.
 */
export function isValidPhone(fullNumber: string): boolean {
  if (!fullNumber) return true;
  const match = COUNTRIES.find((c) => fullNumber.startsWith(c.dialCode));
  if (!match) return false;
  const local = fullNumber.slice(match.dialCode.length);
  return match.localPattern.test(local);
}

/**
 * Normalize a phone value from PhoneInput (already in E.164 format)
 */
export function normalizePhoneValue(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  return `+${digits}`;
}
