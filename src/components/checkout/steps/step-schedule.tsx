"use client";

import { AlertTriangle, MessageSquare, Package, Plus, Gift, EyeOff, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/ui/phone-input";
import type { DeliveryTimeSlot, Occasion } from "@/lib/api";
import type { CartItem } from "@/types";
import type { AddOn, AddOnCategory } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface StepScheduleProps {
  formData: {
    deliveryDate: string;
    deliveryTimeSlotId: string;
    occasionId: string;
    isSurprise: boolean;
    isAnonymous: boolean;
    differentBuyer: boolean;
    senderName: string;
    senderPhone: string;
  };
  onFormChange: (updates: Record<string, unknown>) => void;
  onSelectChange: (name: string, value: string) => void;
  onPhoneChange: (name: string, value: string) => void;
  timeSlots: DeliveryTimeSlot[];
  occasions: Occasion[];
  specialDateWarning: string | null;
  minDeliveryDate: string;
  formatTimeSlot: (start: string, end: string, label: string | null) => string;
  isPickup: boolean;
  user: { fullName: string } | null;
  // Cart items for card messages / add-ons
  items: CartItem[];
  onUpdateCardMessage: (productId: string, message: string) => void;
  onOpenAddOns: (productId: string) => void;
  availableAddOns: AddOn[];
  error: string | null;
  onNext: () => void;
  onBack: () => void;
}

export function StepSchedule({
  formData,
  onFormChange,
  onSelectChange,
  onPhoneChange,
  timeSlots,
  occasions,
  specialDateWarning,
  minDeliveryDate,
  formatTimeSlot,
  isPickup,
  user,
  items,
  onUpdateCardMessage,
  onOpenAddOns,
  availableAddOns,
  error,
  onNext,
  onBack,
}: StepScheduleProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFormChange({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      {/* Date & Time */}
      <div>
        <h2 className="text-lg font-normal mb-4">
          {isPickup ? "Fecha y horario de retiro" : "Fecha y horario de entrega"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-normal mb-2">
              {isPickup ? "Fecha de retiro" : "Fecha de entrega"} <span className="text-destructive">*</span>
            </label>
            <DatePicker
              value={formData.deliveryDate ? new Date(formData.deliveryDate + "T00:00:00") : undefined}
              onChange={(date) => {
                const dateStr = date ? date.toISOString().split("T")[0] : "";
                onSelectChange("deliveryDate", dateStr);
              }}
              minDate={new Date(minDeliveryDate + "T00:00:00")}
              placeholder="Selecciona una fecha"
            />
          </div>
          <div>
            <label className="block text-sm font-normal mb-2">
              {isPickup ? "Horario de retiro" : "Horario de entrega"} <span className="text-destructive">*</span>
            </label>
            <Select value={formData.deliveryTimeSlotId} onValueChange={(v) => onSelectChange("deliveryTimeSlotId", v)}>
              <SelectTrigger><SelectValue placeholder="Selecciona un horario" /></SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {formatTimeSlot(slot.startTime, slot.endTime, slot.displayLabel)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {specialDateWarning && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{specialDateWarning}</p>
          </div>
        )}
      </div>

      {/* Occasion */}
      {occasions.length > 0 && (
        <div>
          <label className="block text-sm font-normal mb-2">Ocasión</label>
          <Select value={formData.occasionId} onValueChange={(v) => onSelectChange("occasionId", v)}>
            <SelectTrigger><SelectValue placeholder="Selecciona una ocasión (opcional)" /></SelectTrigger>
            <SelectContent>
              {occasions.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Card messages & add-ons */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-primary" />
          <label className="block text-sm font-normal">Personaliza tu pedido</label>
          <span className="text-xs text-foreground-secondary">(opcional)</span>
        </div>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="p-3 bg-secondary/20 rounded-lg space-y-3">
              <p className="text-sm font-normal text-foreground">{item.product.name}</p>

              {availableAddOns.length > 0 && (
                <div>
                  {item.addOns && item.addOns.length > 0 ? (
                    <div className="space-y-1.5">
                      {item.addOns.map((addOn) => (
                        <div key={addOn.addOnId} className="flex items-center justify-between text-sm">
                          <span className="text-foreground-secondary">+ {addOn.name}{addOn.quantity > 1 ? ` x${addOn.quantity}` : ""}</span>
                          <span className="text-primary font-normal">{formatPrice(addOn.priceCents * addOn.quantity)}</span>
                        </div>
                      ))}
                      <button type="button" onClick={() => onOpenAddOns(item.product.id)} className="text-xs text-primary hover:underline mt-1">
                        Editar complementos
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenAddOns(item.product.id)}
                      className="group relative flex items-center gap-3 w-full p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary hover:bg-primary/10 transition-all"
                    >
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <Gift className="h-4 w-4" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center animate-pulse">
                          <Plus className="h-2.5 w-2.5 text-white" />
                        </span>
                      </div>
                      <div className="text-left flex-1">
                        <span className="font-normal block">Hazlo más especial</span>
                        <span className="text-xs text-primary/70">Agrega peluches, chocolates y más</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-primary/50 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs text-foreground-secondary mb-1">Dedicatoria de tarjeta</label>
                <Textarea
                  value={item.cardMessage || ""}
                  onChange={(e) => onUpdateCardMessage(item.product.id, e.target.value)}
                  rows={2}
                  maxLength={200}
                  placeholder="Escribe tu dedicatoria aquí..."
                />
                <p className="text-xs text-foreground-muted text-right mt-1">{(item.cardMessage || "").length}/200</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        {!isPickup && (
          <>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox checked={formData.isSurprise} onCheckedChange={(c) => onFormChange({ isSurprise: c === true })} />
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <span className="text-sm font-normal">Es una entrega sorpresa</span>
                  <p className="text-xs text-foreground-secondary">No contactaremos al destinatario antes de la entrega</p>
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox checked={formData.isAnonymous} onCheckedChange={(c) => onFormChange({ isAnonymous: c === true })} />
              <div className="flex items-center gap-2">
                <EyeOff className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <span className="text-sm font-normal">Envío anónimo</span>
                  <p className="text-xs text-foreground-secondary">El destinatario no sabrá quién le envió el pedido</p>
                </div>
              </div>
            </label>
          </>
        )}

        {user && (
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox checked={formData.differentBuyer} onCheckedChange={(c) => onFormChange({ differentBuyer: c === true })} />
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <span className="text-sm font-normal">El comprador es diferente al usuario de la cuenta</span>
                <p className="text-xs text-foreground-secondary">Agrega los datos del comprador</p>
              </div>
            </div>
          </label>
        )}
      </div>

      {/* Different buyer fields */}
      {formData.differentBuyer && user && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
          <div>
            <label className="block text-sm font-normal mb-2">Nombre del comprador <span className="text-destructive">*</span></label>
            <Input name="senderName" value={formData.senderName} onChange={handleChange} placeholder="Nombre completo" />
          </div>
          <div>
            <label className="block text-sm font-normal mb-2">Teléfono del comprador <span className="text-destructive">*</span></label>
            <PhoneInput value={formData.senderPhone} onChange={(val) => onPhoneChange("senderPhone", val)} />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Navigation */}
      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1 h-12" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button type="button" size="lg" className="flex-1 h-12" onClick={onNext}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
