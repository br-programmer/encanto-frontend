"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRIES, type Country } from "@/lib/countries";

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
            "flex items-center gap-1 px-2.5 sm:px-3 border border-r-0 rounded-l-md bg-secondary/30 hover:bg-secondary/50 transition-colors text-sm shrink-0",
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
