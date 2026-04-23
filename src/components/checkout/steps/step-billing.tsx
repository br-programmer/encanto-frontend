"use client";

import { useMemo } from "react";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { DOCUMENT_TYPE_LABELS } from "@/lib/ecuadorian-document";
import { formatPrice, formatPhone } from "@/lib/utils";
import type { InvoiceDocumentType, UserInvoiceProfile } from "@/lib/api";

export interface BillingFormState {
  invoiceProfileId: string; // "" | "new" | profile.id | "final_consumer"
  documentType: InvoiceDocumentType;
  documentNumber: string;
  fullName: string;
  email: string;
  address: string;
  phone: string;
  saveProfile: boolean;
}

interface StepBillingProps {
  billing: BillingFormState;
  onChange: (updates: Partial<BillingFormState>) => void;
  profiles: UserInvoiceProfile[];
  isLoggedIn: boolean;
  totalCents: number;
  finalConsumerLimitCents: number | undefined;
  error: string | null;
  onNext: () => void;
  onBack: () => void;
}

type DocType = "cedula" | "ruc" | "pasaporte";

export function StepBilling({
  billing,
  onChange,
  profiles,
  isLoggedIn,
  totalCents,
  finalConsumerLimitCents,
  error,
  onNext,
  onBack,
}: StepBillingProps) {
  const limitReached = useMemo(() => {
    if (finalConsumerLimitCents == null) return false;
    return totalCents >= finalConsumerLimitCents;
  }, [totalCents, finalConsumerLimitCents]);

  const isFinalConsumer = billing.documentType === "final_consumer";
  const isUsingSavedProfile = !!billing.invoiceProfileId && billing.invoiceProfileId !== "new" && billing.invoiceProfileId !== "final_consumer";

  const handleSelectProfile = (value: string) => {
    if (value === "new") {
      onChange({
        invoiceProfileId: "new",
        documentType: "cedula",
        documentNumber: "",
        fullName: "",
        email: "",
        address: "",
        phone: "",
      });
      return;
    }
    if (value === "final_consumer") {
      onChange({
        invoiceProfileId: "final_consumer",
        documentType: "final_consumer",
        documentNumber: "",
        fullName: "",
        email: "",
        address: "",
        phone: "",
        saveProfile: false,
      });
      return;
    }
    const p = profiles.find((pp) => pp.id === value);
    if (!p) return;
    onChange({
      invoiceProfileId: p.id,
      documentType: p.documentType,
      documentNumber: p.documentNumber,
      fullName: p.fullName,
      email: p.email,
      address: p.address || "",
      phone: p.phone || "",
      saveProfile: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-normal">Datos de facturación</h2>
      </div>

      <p className="text-sm text-foreground-secondary">
        Ecuador requiere emisión electrónica de factura. Ingresa los datos del adquirente.
      </p>

      {/* Saved profiles selector */}
      {isLoggedIn && profiles.length > 0 && (
        <div>
          <label className="block text-sm font-normal mb-2">Perfil de facturación</label>
          <Select
            value={billing.invoiceProfileId || ""}
            onValueChange={handleSelectProfile}
          >
            <SelectTrigger>
              <SelectValue placeholder="Elegir perfil guardado" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {(p.nickname || p.fullName) + " — " + p.documentNumber}
                </SelectItem>
              ))}
              <SelectItem value="new">Ingresar datos manualmente</SelectItem>
              {!limitReached && (
                <SelectItem value="final_consumer">Facturar a consumidor final</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Final consumer checkbox (when no profiles, for quick access) */}
      {(!isLoggedIn || profiles.length === 0) && !limitReached && (
        <label className="flex items-start gap-2 cursor-pointer p-3 rounded-lg bg-secondary/20 border border-border">
          <Checkbox
            checked={isFinalConsumer}
            onCheckedChange={(c) => {
              if (c === true) {
                onChange({
                  invoiceProfileId: "final_consumer",
                  documentType: "final_consumer",
                  documentNumber: "",
                  fullName: "",
                  email: "",
                  address: "",
                  phone: "",
                  saveProfile: false,
                });
              } else {
                onChange({
                  invoiceProfileId: "new",
                  documentType: "cedula",
                  documentNumber: "",
                  fullName: "",
                  email: "",
                });
              }
            }}
          />
          <div>
            <span className="text-sm font-normal">Facturar a consumidor final</span>
            <p className="text-xs text-foreground-secondary">
              Disponible para pedidos menores a {formatPrice(finalConsumerLimitCents ?? 5000)}
            </p>
          </div>
        </label>
      )}

      {limitReached && isFinalConsumer && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          El total supera {formatPrice(finalConsumerLimitCents!)} — debes identificar al adquirente con cédula, RUC o pasaporte.
        </div>
      )}

      {/* Manual form (hidden when using a saved profile, final consumer, or nothing selected) */}
      {!isUsingSavedProfile && !isFinalConsumer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-normal mb-2">
              Tipo de documento <span className="text-destructive">*</span>
            </label>
            <Select
              value={billing.documentType === "final_consumer" ? "cedula" : billing.documentType}
              onValueChange={(v) => onChange({ documentType: v as DocType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["cedula", "ruc", "pasaporte"] as DocType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {DOCUMENT_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-normal mb-2">
              Número <span className="text-destructive">*</span>
            </label>
            <Input
              value={billing.documentNumber}
              onChange={(e) => onChange({ documentNumber: e.target.value })}
              placeholder={
                billing.documentType === "cedula"
                  ? "1712345678"
                  : billing.documentType === "ruc"
                    ? "1712345678001"
                    : "A1234567"
              }
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-normal mb-2">
              Nombre / Razón social <span className="text-destructive">*</span>
            </label>
            <Input
              value={billing.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-normal mb-2">
              Correo <span className="text-destructive">*</span>
            </label>
            <Input
              type="email"
              value={billing.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="factura@example.com"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-normal mb-2">Dirección (opcional)</label>
            <Input
              value={billing.address}
              onChange={(e) => onChange({ address: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-normal mb-2">Teléfono (opcional)</label>
            <PhoneInput
              value={billing.phone}
              onChange={(val) => onChange({ phone: val })}
            />
          </div>

          {isLoggedIn && (
            <div className="sm:col-span-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={billing.saveProfile}
                  onCheckedChange={(c) => onChange({ saveProfile: c === true })}
                />
                <span className="text-sm">Guardar estos datos para próximas compras</span>
              </label>
            </div>
          )}
        </div>
      )}

      {isUsingSavedProfile && (
        <div className="p-3 rounded-lg bg-secondary/30 border border-border text-sm space-y-1">
          <p><span className="text-foreground-secondary">Documento:</span> {DOCUMENT_TYPE_LABELS[billing.documentType as DocType]} — {billing.documentNumber}</p>
          <p><span className="text-foreground-secondary">Nombre:</span> {billing.fullName}</p>
          <p><span className="text-foreground-secondary">Correo:</span> {billing.email}</p>
          {billing.address && <p><span className="text-foreground-secondary">Dirección:</span> {billing.address}</p>}
          {billing.phone && <p><span className="text-foreground-secondary">Teléfono:</span> {formatPhone(billing.phone)}</p>}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1 h-12" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button type="button" size="lg" className="flex-1 h-12" onClick={onNext}>
          Continuar
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
