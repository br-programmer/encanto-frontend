"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Home,
  Briefcase,
  Star,
  Camera,
  X,
  Package,
  Lock,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth-store";
import { useAddressesStore, type DeliveryAddress } from "@/stores/addresses-store";
import { resendVerificationAction, uploadAvatarAction, deleteAvatarAction } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function PerfilPage() {
  const router = useRouter();
  const { user, tokens, logout, refreshToken, fetchUser, isLoading: authLoading, _hasHydrated } = useAuthStore();
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddressesStore();

  const [mounted, setMounted] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    label: "Casa",
    recipientName: "",
    recipientPhone: "",
    address: "",
    city: "Manta",
    zone: "",
    notes: "",
    isDefault: false,
  });

  useEffect(() => {
    setMounted(true);
    // Fetch fresh user data when profile page loads
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (mounted && _hasHydrated && !authLoading && !user) {
      router.push("/");
    }
  }, [mounted, _hasHydrated, authLoading, user, router]);

  const handleResendVerification = async () => {
    if (!tokens?.accessToken) return;
    setIsResendingVerification(true);
    try {
      await resendVerificationAction(tokens.accessToken);
      setVerificationSent(true);
    } catch (error) {
      // If 401, try refreshing token and retry
      if (error instanceof Error && error.message.includes("401")) {
        const refreshed = await refreshToken();
        if (refreshed) {
          try {
            const newTokens = useAuthStore.getState().tokens;
            if (newTokens?.accessToken) {
              await resendVerificationAction(newTokens.accessToken);
              setVerificationSent(true);
              return;
            }
          } catch (retryError) {
            console.error("Error resending verification after refresh:", retryError);
          }
        }
      }
      console.error("Error resending verification:", error);
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };


  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Formato no válido. Usa JPEG, PNG o WebP.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es muy grande. Máximo 5MB.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadAvatarAction(formData, tokens!.accessToken);
      await fetchUser();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Error al subir la imagen. Intenta de nuevo.");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm("¿Estás seguro de eliminar tu foto de perfil?")) return;

    setIsUploadingAvatar(true);
    try {
      await deleteAvatarAction(tokens!.accessToken);
      await fetchUser();
    } catch (error) {
      console.error("Error deleting avatar:", error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const resetAddressForm = () => {
    setAddressFormData({
      label: "Casa",
      recipientName: user?.fullName || "",
      recipientPhone: user?.phone || "",
      address: "",
      city: "Manta",
      zone: "",
      notes: "",
      isDefault: addresses.length === 0,
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const handleEditAddress = (address: DeliveryAddress) => {
    setEditingAddress(address);
    setAddressFormData({
      label: address.label,
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      address: address.address,
      city: address.city,
      zone: address.zone,
      notes: address.notes || "",
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleSaveAddress = () => {
    if (!addressFormData.recipientName || !addressFormData.address || !addressFormData.zone) {
      return;
    }

    if (editingAddress) {
      updateAddress(editingAddress.id, addressFormData);
    } else {
      addAddress(addressFormData);
    }
    resetAddressForm();
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta dirección?")) {
      deleteAddress(id);
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label) {
      case "Casa":
        return <Home className="h-4 w-4" />;
      case "Trabajo":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  if (!mounted || !_hasHydrated || authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6 sm:mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Card */}
          <div className="bg-background rounded-xl border border-border p-4 sm:p-6">
            <div className="flex flex-col items-center mb-6">
              {/* Avatar */}
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.fullName}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary" />
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                {/* Upload/Delete buttons */}
                <div className="absolute -bottom-1 -right-1 flex gap-1">
                  <label className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-md">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                  </label>
                  {user.avatarUrl && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={isUploadingAvatar}
                      className="w-8 h-8 bg-destructive text-white rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <h2 className="text-xl font-medium text-center">{user.fullName}</h2>
              <p className="text-sm text-foreground-secondary">Cliente</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-foreground-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground-secondary">Correo</p>
                  <p className="truncate text-sm sm:text-base">{user.email}</p>
                </div>
                {user.emailVerified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-foreground-muted flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground-secondary">Teléfono</p>
                  <p className="text-sm sm:text-base">{user.phone}</p>
                </div>
              </div>
            </div>

            {/* Email verification warning */}
            {!user.emailVerified && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 mb-3">
                  Tu correo electrónico no está verificado. Verifica tu cuenta para acceder a todas las funcionalidades.
                </p>
                {verificationSent ? (
                  <p className="text-sm text-green-700 font-normal">
                    Correo de verificación enviado. Revisa tu bandeja de entrada.
                  </p>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResendingVerification}
                  >
                    {isResendingVerification ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Reenviar correo de verificación"
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Quick Links */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border space-y-2">
              <Link
                href="/perfil/pedidos"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm font-normal">Mis pedidos</span>
                </div>
                <ChevronRight className="h-4 w-4 text-foreground-secondary" />
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Addresses */}
        <div className="lg:col-span-2">
          <div className="bg-background rounded-xl border border-border p-4 sm:p-6">
            <div className="flex items-start sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-medium">Direcciones de entrega</h2>
                  <p className="text-sm text-foreground-secondary">
                    {addresses.length} {addresses.length === 1 ? "dirección guardada" : "direcciones guardadas"}
                  </p>
                </div>
              </div>
              {!showAddressForm && (
                <Button
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => {
                    resetAddressForm();
                    setAddressFormData(prev => ({
                      ...prev,
                      recipientName: user.fullName,
                      recipientPhone: user.phone,
                      isDefault: addresses.length === 0,
                    }));
                    setShowAddressForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Agregar</span>
                </Button>
              )}
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <div className="mb-6 p-3 sm:p-4 bg-secondary/30 rounded-lg border border-border">
                <h3 className="font-normal mb-4">
                  {editingAddress ? "Editar dirección" : "Nueva dirección"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Label */}
                  <div>
                    <label className="block text-sm font-normal mb-2">Etiqueta</label>
                    <Select value={addressFormData.label} onValueChange={(value) => setAddressFormData({ ...addressFormData, label: value })}>
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

                  {/* Recipient Name */}
                  <div>
                    <label className="block text-sm font-normal mb-2">
                      Nombre del destinatario <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      value={addressFormData.recipientName}
                      onChange={(e) => setAddressFormData({ ...addressFormData, recipientName: e.target.value })}
                      placeholder="Nombre completo"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-normal mb-2">
                      Teléfono <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={addressFormData.recipientPhone}
                      onChange={(e) => setAddressFormData({ ...addressFormData, recipientPhone: e.target.value })}
                      placeholder="+593 99 999 9999"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-normal mb-2">Ciudad</label>
                    <Select value={addressFormData.city} onValueChange={(value) => setAddressFormData({ ...addressFormData, city: value })}>
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

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-normal mb-2">
                      Dirección <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      value={addressFormData.address}
                      onChange={(e) => setAddressFormData({ ...addressFormData, address: e.target.value })}
                      placeholder="Calle principal, número, referencias"
                    />
                  </div>

                  {/* Zone */}
                  <div>
                    <label className="block text-sm font-normal mb-2">
                      Zona/Sector <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      value={addressFormData.zone}
                      onChange={(e) => setAddressFormData({ ...addressFormData, zone: e.target.value })}
                      placeholder="Ej: Barrio Américas"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-normal mb-2">Notas adicionales</label>
                    <Input
                      type="text"
                      value={addressFormData.notes}
                      onChange={(e) => setAddressFormData({ ...addressFormData, notes: e.target.value })}
                      placeholder="Ej: Casa color azul"
                    />
                  </div>

                  {/* Default checkbox */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={addressFormData.isDefault}
                        onCheckedChange={(checked) => setAddressFormData({ ...addressFormData, isDefault: checked === true })}
                      />
                      <span className="text-sm">Establecer como dirección predeterminada</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button onClick={handleSaveAddress} className="w-full sm:w-auto">
                    {editingAddress ? "Guardar cambios" : "Agregar dirección"}
                  </Button>
                  <Button variant="outline" onClick={resetAddressForm} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Addresses List */}
            {addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-foreground-muted" />
                </div>
                <p className="text-foreground-secondary mb-4">
                  No tienes direcciones guardadas
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddressFormData(prev => ({
                      ...prev,
                      recipientName: user.fullName,
                      recipientPhone: user.phone,
                      isDefault: true,
                    }));
                    setShowAddressForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primera dirección
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={cn(
                      "p-3 sm:p-4 rounded-lg border transition-colors",
                      address.isDefault
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {getLabelIcon(address.label)}
                          <span className="font-normal">{address.label}</span>
                          {address.isDefault && (
                            <span className="inline-flex items-center gap-1 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                              <Star className="h-3 w-3" />
                              Predeterminada
                            </span>
                          )}
                        </div>
                        <p className="text-foreground-secondary text-sm mb-1 truncate">
                          {address.recipientName} - {address.recipientPhone}
                        </p>
                        <p className="text-sm truncate">{address.address}</p>
                        <p className="text-sm text-foreground-secondary">
                          {address.zone}, {address.city}
                        </p>
                        {address.notes && (
                          <p className="text-sm text-foreground-muted mt-1 truncate">
                            Nota: {address.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {!address.isDefault && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDefaultAddress(address.id)}
                            title="Establecer como predeterminada"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditAddress(address)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteAddress(address.id)}
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
        </div>
      </div>
    </div>
  );
}
