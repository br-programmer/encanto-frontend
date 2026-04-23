"use client";

import { Truck, Store, MapPin, Plus, Bookmark, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/ui/phone-input";
import dynamic from "next/dynamic";
import type { City, Branch, DeliveryZone, DeliveryAddressApi } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";

const MapPicker = dynamic(() => import("../map-picker").then(m => ({ default: m.MapPicker })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-lg border border-border bg-secondary/30 flex items-center justify-center">
      <span className="text-sm text-foreground-secondary">Cargando mapa...</span>
    </div>
  ),
});

interface StepDeliveryProps {
  formData: {
    fulfillmentType: string;
    recipientName: string;
    recipientPhone: string;
    address: string;
    cityId: string;
    branchId: string;
    deliveryZoneId: string;
    deliveryReference: string;
    latitude: number;
    longitude: number;
  };
  onFormChange: (updates: Record<string, unknown>) => void;
  onSelectChange: (name: string, value: string) => void;
  onMapLocationChange: (lat: number, lng: number, zone: DeliveryZone | null) => void;
  onPhoneChange: (name: string, value: string) => void;
  cities: City[];
  branches: Branch[];
  zones: DeliveryZone[];
  addresses: DeliveryAddressApi[];
  selectedAddressId: string | null;
  onSelectAddress: (address: DeliveryAddressApi) => void;
  onNewAddress: () => void;
  saveAddress: boolean;
  onSaveAddressChange: (save: boolean) => void;
  addressLabel: string;
  onAddressLabelChange: (label: string) => void;
  user: { fullName: string } | null;
  isPickup: boolean;
  error: string | null;
  onNext: () => void;
  onBack?: () => void;
}

export function StepDelivery({
  formData,
  onFormChange,
  onSelectChange,
  onMapLocationChange,
  onPhoneChange,
  cities,
  branches,
  zones,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onNewAddress,
  saveAddress,
  onSaveAddressChange,
  addressLabel,
  onAddressLabelChange,
  user,
  isPickup,
  error,
  onNext,
  onBack,
}: StepDeliveryProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onFormChange({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Fulfillment Type */}
      <div>
        <h2 className="text-lg font-normal mb-4">Tipo de entrega</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onFormChange({ fulfillmentType: "delivery", deliveryZoneId: "", address: "" })}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
              formData.fulfillmentType === "delivery" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
          >
            <Truck className={cn("h-6 w-6", formData.fulfillmentType === "delivery" ? "text-primary" : "text-foreground-muted")} />
            <span className={cn("text-sm font-normal", formData.fulfillmentType === "delivery" ? "text-primary" : "text-foreground-secondary")}>
              Envío a domicilio
            </span>
          </button>
          <button
            type="button"
            onClick={() => onFormChange({ fulfillmentType: "pickup", deliveryZoneId: "", address: "" })}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors",
              formData.fulfillmentType === "pickup" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
          >
            <Store className={cn("h-6 w-6", formData.fulfillmentType === "pickup" ? "text-primary" : "text-foreground-muted")} />
            <span className={cn("text-sm font-normal", formData.fulfillmentType === "pickup" ? "text-primary" : "text-foreground-secondary")}>
              Retiro en tienda
            </span>
          </button>
        </div>
      </div>

      {/* Recipient info */}
      <div>
        <h2 className="text-lg font-normal mb-4">
          {isPickup ? "Información de retiro" : "Información de entrega"}
        </h2>

        {/* Saved Addresses */}
        {!isPickup && addresses.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-normal text-foreground-secondary">Direcciones guardadas</h3>
              <button type="button" onClick={onNewAddress} className="text-sm text-primary hover:underline flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Nueva dirección
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => onSelectAddress(addr)}
                  className={cn(
                    "text-left p-3 border rounded-lg transition-all",
                    selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-normal text-sm">{addr.nickname || addr.recipientName}</span>
                        {addr.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">Predeterminada</span>
                        )}
                      </div>
                      <p className="text-sm text-foreground-secondary truncate">{addr.recipientName}</p>
                      <p className="text-xs text-foreground-muted truncate">{addr.address}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className={cn("grid gap-4", isPickup ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
            <div>
              <label className="block text-sm font-normal mb-2">
                {isPickup ? "Nombre de quien retira" : "Nombre del destinatario"} <span className="text-destructive">*</span>
              </label>
              <Input
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder={isPickup ? "¿Quién retira el pedido?" : "¿Quién recibe las flores?"}
              />
            </div>
            {!isPickup && (
              <div>
                <label className="block text-sm font-normal mb-2">
                  Teléfono del destinatario <span className="text-destructive">*</span>
                </label>
                <PhoneInput
                  value={formData.recipientPhone}
                  onChange={(val) => onPhoneChange("recipientPhone", val)}
                />
              </div>
            )}
          </div>

          {/* Pickup branch */}
          {isPickup && branches.length > 1 && (
            <div>
              <label className="block text-sm font-normal mb-2">Sucursal de retiro <span className="text-destructive">*</span></label>
              <Select value={formData.branchId} onValueChange={(v) => onSelectChange("branchId", v)}>
                <SelectTrigger><SelectValue placeholder="Selecciona una sucursal" /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {isPickup && branches.length === 1 && (
            <div className="p-3 bg-secondary/30 rounded-lg">
              <p className="font-normal text-sm">{branches[0].name}</p>
              {branches[0].address && <p className="text-sm text-foreground-secondary mt-1">{branches[0].address}</p>}
            </div>
          )}

          {/* Delivery fields */}
          {!isPickup && (
            <>
              <div>
                <label className="block text-sm font-normal mb-2">Dirección de entrega <span className="text-destructive">*</span></label>
                <Input name="address" value={formData.address} onChange={handleChange} placeholder="Calle, número, edificio, referencia..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-normal mb-2">Ciudad <span className="text-destructive">*</span></label>
                  <Select value={formData.cityId} onValueChange={(v) => onSelectChange("cityId", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona una ciudad" /></SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {branches.length > 1 && (
                  <div>
                    <label className="block text-sm font-normal mb-2">Sucursal <span className="text-destructive">*</span></label>
                    <Select value={formData.branchId} onValueChange={(v) => onSelectChange("branchId", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecciona una sucursal" /></SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {zones.length > 0 && (
                <div>
                  <label className="block text-sm font-normal mb-2">Zona de entrega <span className="text-destructive">*</span></label>
                  <Select value={formData.deliveryZoneId} onValueChange={(v) => onSelectChange("deliveryZoneId", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecciona una zona" /></SelectTrigger>
                    <SelectContent>
                      {zones.map((z) => (
                        <SelectItem key={z.id} value={z.id}>
                          {z.zoneName} — {formatPrice(z.deliveryFeeCents)}
                          {z.estimatedMinutes ? ` (~${z.estimatedMinutes} min)` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <MapPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={onMapLocationChange}
                zones={zones}
                selectedZoneId={formData.deliveryZoneId}
              />

              <div>
                <label className="block text-sm font-normal mb-2">Referencia de ubicación</label>
                <Textarea name="deliveryReference" value={formData.deliveryReference} onChange={handleChange} rows={2} placeholder="Instrucciones especiales..." />
              </div>
            </>
          )}

          {/* Save address */}
          {!isPickup && !selectedAddressId && user && (
            <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={saveAddress} onCheckedChange={(c) => onSaveAddressChange(c === true)} />
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-sm font-normal">Guardar esta dirección</span>
                    <p className="text-xs text-foreground-secondary">Para futuros pedidos</p>
                  </div>
                </div>
              </label>
              {saveAddress && (
                <div>
                  <label className="block text-sm font-normal mb-2">Etiqueta</label>
                  <Select value={addressLabel} onValueChange={onAddressLabelChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Casa">Casa</SelectItem>
                      <SelectItem value="Trabajo">Trabajo</SelectItem>
                      <SelectItem value="Oficina">Oficina</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Navigation */}
      <div className={onBack ? "flex gap-3" : ""}>
        {onBack && (
          <Button type="button" variant="outline" size="lg" className="flex-1 h-12" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
        )}
        <Button type="button" size="lg" className={onBack ? "flex-1 h-12" : "w-full h-12"} onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
