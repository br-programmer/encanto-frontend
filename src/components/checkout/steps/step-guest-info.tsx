"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";

interface StepGuestInfoProps {
  formData: {
    senderName: string;
    senderEmail: string;
    senderPhone: string;
  };
  onFormChange: (updates: Record<string, unknown>) => void;
  onPhoneChange: (name: string, value: string) => void;
  onSwitchToLogin: () => void;
  error: string | null;
  onNext: () => void;
}

export function StepGuestInfo({
  formData,
  onFormChange,
  onPhoneChange,
  onSwitchToLogin,
  error,
  onNext,
}: StepGuestInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-normal">Tus datos de contacto</h2>
          <button type="button" onClick={onSwitchToLogin} className="text-sm text-primary hover:underline">
            Iniciar sesión
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-normal mb-2">
              Tu nombre <span className="text-destructive">*</span>
            </label>
            <Input
              value={formData.senderName}
              onChange={(e) => onFormChange({ senderName: e.target.value })}
              placeholder="Tu nombre completo"
            />
          </div>
          <div>
            <label className="block text-sm font-normal mb-2">
              Tu teléfono <span className="text-destructive">*</span>
            </label>
            <PhoneInput
              value={formData.senderPhone}
              onChange={(val) => onPhoneChange("senderPhone", val)}
            />
          </div>
          <div>
            <label className="block text-sm font-normal mb-2">
              Tu correo electrónico <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              value={formData.senderEmail}
              onChange={(e) => onFormChange({ senderEmail: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="button" size="lg" className="w-full h-12" onClick={onNext}>
        Continuar
      </Button>
    </div>
  );
}
