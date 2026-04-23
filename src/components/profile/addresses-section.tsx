"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import {
  getDeliveryAddressesAction,
  createDeliveryAddressAction,
  updateDeliveryAddressAction,
  deleteDeliveryAddressAction,
  setDefaultDeliveryAddressAction,
} from "@/actions/address-actions";
import type {
  DeliveryAddressApi,
  CreateDeliveryAddressRequest,
} from "@/lib/api";
import { cn, formatPhone } from "@/lib/utils";

const MapPicker = dynamic(
  () => import("@/components/checkout/map-picker").then((m) => ({ default: m.MapPicker })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[250px] rounded-lg border border-border bg-secondary/30 flex items-center justify-center">
        <span className="text-sm text-foreground-secondary">Cargando mapa...</span>
      </div>
    ),
  }
);

interface AddressesSectionProps {
  accessToken: string;
  userFullName?: string;
  userPhone?: string;
}

interface FormState {
  nickname: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  reference: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

const EMPTY_FORM: FormState = {
  nickname: "Casa",
  recipientName: "",
  recipientPhone: "",
  address: "",
  city: "Manta",
  reference: "",
  latitude: -0.95,
  longitude: -80.73,
  isDefault: false,
};

export function AddressesSection({
  accessToken,
  userFullName,
  userPhone,
}: AddressesSectionProps) {
  const [addresses, setAddresses] = useState<DeliveryAddressApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DeliveryAddressApi | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await getDeliveryAddressesAction(accessToken, { limit: 50 });
      setAddresses(res.result);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Error al cargar direcciones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowForm(false);
    setFormError(null);
  };

  const handleAdd = () => {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      recipientName: userFullName || "",
      recipientPhone: userPhone || "",
      isDefault: addresses.length === 0,
    });
    setShowForm(true);
  };

  const handleEdit = (a: DeliveryAddressApi) => {
    setEditing(a);
    setForm({
      nickname: a.nickname || "",
      recipientName: a.recipientName,
      recipientPhone: a.recipientPhone,
      address: a.address,
      city: a.city,
      reference: a.reference || "",
      latitude: parseFloat(a.latitude),
      longitude: parseFloat(a.longitude),
      isDefault: a.isDefault,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.recipientName.trim()) return setFormError("Ingresa el nombre del destinatario");
    if (!form.recipientPhone.trim()) return setFormError("Ingresa el teléfono");
    if (!form.address.trim()) return setFormError("Ingresa la dirección");
    if (!form.city.trim()) return setFormError("Ingresa la ciudad");

    setFormError(null);
    setIsSubmitting(true);
    try {
      const payload: CreateDeliveryAddressRequest = {
        recipientName: form.recipientName.trim(),
        recipientPhone: form.recipientPhone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
        ...(form.nickname.trim() ? { nickname: form.nickname.trim() } : {}),
        ...(form.reference.trim() ? { reference: form.reference.trim() } : {}),
        isDefault: form.isDefault,
      };

      if (editing) {
        const updated = await updateDeliveryAddressAction(editing.id, payload, accessToken);
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const created = await createDeliveryAddressAction(payload, accessToken);
        setAddresses((prev) => [created, ...prev]);
      }
      if (form.isDefault) await load();
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta dirección?")) return;
    try {
      await deleteDeliveryAddressAction(id, accessToken);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultDeliveryAddressAction(id, accessToken);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al marcar como default");
    }
  };

  return (
    <div className="bg-background rounded-xl border border-border p-4 sm:p-6">
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-medium">Direcciones de entrega</h2>
            <p className="text-sm text-foreground-secondary">
              {isLoading
                ? "Cargando..."
                : `${addresses.length} ${addresses.length === 1 ? "dirección guardada" : "direcciones guardadas"}`}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleAdd} className="flex-shrink-0">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Agregar</span>
        </Button>
      </div>

      {loadError && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
          {loadError}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={isSubmitting ? () => {} : resetForm}
        title={editing ? "Editar dirección" : "Nueva dirección"}
        size="lg"
        closeOnOverlayClick={!isSubmitting}
        footer={
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : editing ? (
                "Guardar cambios"
              ) : (
                "Agregar dirección"
              )}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-normal mb-2">Alias</label>
            <Select
              value={form.nickname || "Casa"}
              onValueChange={(value) => setForm({ ...form, nickname: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Casa">Casa</SelectItem>
                <SelectItem value="Trabajo">Trabajo</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-normal mb-2">
              Nombre del destinatario <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.recipientName}
              onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-normal mb-2">
              Teléfono <span className="text-destructive">*</span>
            </label>
            <PhoneInput
              value={form.recipientPhone}
              onChange={(val) => setForm({ ...form, recipientPhone: val })}
            />
          </div>

          <div>
            <label className="block text-sm font-normal mb-2">
              Ciudad <span className="text-destructive">*</span>
            </label>
            <Select
              value={form.city}
              onValueChange={(value) => setForm({ ...form, city: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manta">Manta</SelectItem>
                <SelectItem value="Portoviejo">Portoviejo</SelectItem>
                <SelectItem value="Montecristi">Montecristi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-normal mb-2">
              Dirección <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Calle principal, número, referencias"
            />
          </div>

          <div className="md:col-span-2">
            <MapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onLocationChange={(lat, lng) =>
                setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))
              }
              disableZoneValidation
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-normal mb-2">Referencia (opcional)</label>
            <Input
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="Ej: Cerca del parque, casa azul"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={form.isDefault}
                onCheckedChange={(c) => setForm({ ...form, isDefault: c === true })}
              />
              <span className="text-sm">Establecer como dirección predeterminada</span>
            </label>
          </div>
        </div>

        {formError && <p className="mt-3 text-sm text-destructive">{formError}</p>}
      </Modal>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-border">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-56 mb-1" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-foreground-muted" />
          </div>
          <p className="text-foreground-secondary mb-4">
            No tienes direcciones guardadas
          </p>
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar primera dirección
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((a) => (
            <div
              key={a.id}
              className={cn(
                "p-3 sm:p-4 rounded-lg border transition-colors",
                a.isDefault
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="font-normal">{a.nickname || a.recipientName}</span>
                    {a.isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3" />
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-foreground-secondary text-sm mb-1 truncate">
                    {a.recipientName} — {formatPhone(a.recipientPhone)}
                  </p>
                  <p className="text-sm truncate">
                    {a.address}, {a.city}
                  </p>
                  {a.reference && (
                    <p className="text-sm text-foreground-muted mt-1 truncate">
                      {a.reference}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!a.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleSetDefault(a.id)}
                      title="Establecer como predeterminada"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(a)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
