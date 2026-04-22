"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Pencil, Trash2, Star, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { validateDocumentByType, DOCUMENT_TYPE_LABELS } from "@/lib/ecuadorian-document";
import {
  getInvoiceProfilesAction,
  createInvoiceProfileAction,
  updateInvoiceProfileAction,
  deleteInvoiceProfileAction,
  setDefaultInvoiceProfileAction,
} from "@/actions/invoice-profile-actions";
import type {
  UserInvoiceProfile,
  CreateUserInvoiceProfileRequest,
} from "@/lib/api";

type DocType = "cedula" | "ruc" | "pasaporte";

interface FormState {
  nickname: string;
  documentType: DocType;
  documentNumber: string;
  fullName: string;
  email: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

const EMPTY_FORM: FormState = {
  nickname: "",
  documentType: "cedula",
  documentNumber: "",
  fullName: "",
  email: "",
  address: "",
  phone: "",
  isDefault: false,
};

interface InvoiceProfilesSectionProps {
  accessToken: string;
  userEmail?: string;
  userPhone?: string;
  userFullName?: string;
}

export function InvoiceProfilesSection({
  accessToken,
  userEmail,
  userPhone,
  userFullName,
}: InvoiceProfilesSectionProps) {
  const [profiles, setProfiles] = useState<UserInvoiceProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UserInvoiceProfile | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await getInvoiceProfilesAction(accessToken, { limit: 50 });
      setProfiles(res.result);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Error al cargar perfiles");
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
      fullName: userFullName || "",
      email: userEmail || "",
      phone: userPhone || "",
      isDefault: profiles.length === 0,
    });
    setShowForm(true);
  };

  const handleEdit = (p: UserInvoiceProfile) => {
    setEditing(p);
    setForm({
      nickname: p.nickname || "",
      documentType: p.documentType,
      documentNumber: p.documentNumber,
      fullName: p.fullName,
      email: p.email,
      address: p.address || "",
      phone: p.phone || "",
      isDefault: p.isDefault,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!form.fullName.trim()) return setFormError("Ingresa el nombre o razón social");
    if (!form.email.trim()) return setFormError("Ingresa el correo");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return setFormError("Correo inválido");
    const docCheck = validateDocumentByType(form.documentType, form.documentNumber);
    if (!docCheck.valid) return setFormError(docCheck.error || "Documento inválido");

    setFormError(null);
    setIsSubmitting(true);
    try {
      const payload: CreateUserInvoiceProfileRequest = {
        documentType: form.documentType,
        documentNumber: form.documentNumber.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        ...(form.nickname.trim() ? { nickname: form.nickname.trim() } : {}),
        ...(form.address.trim() ? { address: form.address.trim() } : {}),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        isDefault: form.isDefault,
      };
      if (editing) {
        const updated = await updateInvoiceProfileAction(editing.id, payload, accessToken);
        setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createInvoiceProfileAction(payload, accessToken);
        setProfiles((prev) => [created, ...prev]);
      }
      // If we marked default, refresh to sync other rows' isDefault flags
      if (form.isDefault) await load();
      resetForm();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este perfil de facturación?")) return;
    try {
      await deleteInvoiceProfileAction(id, accessToken);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultInvoiceProfileAction(id, accessToken);
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
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-medium">Datos de facturación</h2>
            <p className="text-sm text-foreground-secondary">
              {isLoading
                ? "Cargando..."
                : `${profiles.length} ${profiles.length === 1 ? "perfil guardado" : "perfiles guardados"}`}
            </p>
          </div>
        </div>
        {!showForm && (
          <Button size="sm" onClick={handleAdd} className="flex-shrink-0">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        )}
      </div>

      {loadError && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
          {loadError}
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-3 sm:p-4 bg-secondary/30 rounded-lg border border-border">
          <h3 className="font-normal mb-4">
            {editing ? "Editar perfil de facturación" : "Nuevo perfil de facturación"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal mb-2">Alias (opcional)</label>
              <Input
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                placeholder="Personal, Empresa X..."
              />
            </div>

            <div>
              <label className="block text-sm font-normal mb-2">
                Tipo de documento <span className="text-destructive">*</span>
              </label>
              <Select
                value={form.documentType}
                onValueChange={(v) => setForm({ ...form, documentType: v as DocType })}
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
                value={form.documentNumber}
                onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                placeholder={
                  form.documentType === "cedula"
                    ? "1712345678"
                    : form.documentType === "ruc"
                      ? "1712345678001"
                      : "A1234567"
                }
              />
            </div>

            <div>
              <label className="block text-sm font-normal mb-2">
                Nombre / Razón social <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-normal mb-2">
                Correo <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="factura@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-normal mb-2">Dirección (opcional)</label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-normal mb-2">Teléfono (opcional)</label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+593..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.isDefault}
                  onCheckedChange={(c) => setForm({ ...form, isDefault: c === true })}
                />
                <span className="text-sm">Usar como perfil predeterminado</span>
              </label>
            </div>
          </div>

          {formError && (
            <p className="mt-3 text-sm text-destructive">{formError}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : editing ? (
                "Guardar cambios"
              ) : (
                "Agregar perfil"
              )}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

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
      ) : profiles.length === 0 && !showForm ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-foreground-muted" />
          </div>
          <p className="text-foreground-secondary mb-4">
            No tienes perfiles de facturación guardados
          </p>
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar primer perfil
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((p) => (
            <div
              key={p.id}
              className={cn(
                "p-3 sm:p-4 rounded-lg border transition-colors",
                p.isDefault
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-normal">
                      {p.nickname || p.fullName}
                    </span>
                    {p.isDefault && (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3" />
                        Predeterminado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground-secondary truncate">
                    {DOCUMENT_TYPE_LABELS[p.documentType]}: {p.documentNumber}
                  </p>
                  {p.nickname && (
                    <p className="text-sm truncate">{p.fullName}</p>
                  )}
                  <p className="text-sm text-foreground-secondary truncate">{p.email}</p>
                  {p.address && (
                    <p className="text-sm text-foreground-muted truncate">{p.address}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!p.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleSetDefault(p.id)}
                      title="Establecer como predeterminado"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(p)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(p.id)}
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
