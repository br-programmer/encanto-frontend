"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Camera,
  X,
  Package,
  FileText,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { resendVerificationAction, uploadAvatarAction, deleteAvatarAction } from "@/actions/auth-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatPhone } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AddressesSection } from "@/components/profile/addresses-section";
import { InvoiceProfilesSection } from "@/components/profile/invoice-profiles-section";

type Section = "direcciones" | "facturacion";

export default function PerfilPage() {
  const router = useRouter();
  const { user, tokens, logout, refreshToken, fetchUser, isLoading: authLoading, _hasHydrated } = useAuthStore();
  const { addToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [section, setSection] = useState<Section>("direcciones");

  useEffect(() => {
    setMounted(true);
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

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      addToast("Formato no válido. Usa JPEG, PNG o WebP.", "error");
      e.target.value = "";
      return;
    }

    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      addToast(
        `La imagen pesa ${sizeMb} MB. El tamaño máximo es ${MAX_MB} MB.`,
        "error"
      );
      e.target.value = "";
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
      addToast("Error al subir la imagen. Intenta de nuevo.", "error");
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

  if (!mounted || !_hasHydrated || authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Skeleton className="h-9 w-40 mb-6 sm:mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
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
        {/* Left Column - User Info + Menu */}
        <div className="lg:col-span-1 space-y-6">
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
                <Mail className="h-5 w-5 text-foreground-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground-secondary">Correo</p>
                  <p className="truncate text-sm sm:text-base">{user.email}</p>
                </div>
                {user.emailVerified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-foreground-muted shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground-secondary">Teléfono</p>
                  <p className="text-sm sm:text-base">{formatPhone(user.phone)}</p>
                </div>
              </div>
            </div>

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
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border space-y-1">
              <Link
                href="/pedidos"
                className="group flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="text-sm font-normal">Mis pedidos</span>
                </div>
                <ChevronRight className="h-4 w-4 text-foreground-secondary group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <button
                type="button"
                onClick={() => setSection("direcciones")}
                className={cn(
                  "group w-full flex items-center justify-between p-3 rounded-lg transition-colors",
                  section === "direcciones"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-secondary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <MapPin
                    className={cn(
                      "h-5 w-5",
                      section === "direcciones" ? "text-primary" : "text-primary"
                    )}
                  />
                  <span className="text-sm font-normal">Mis direcciones</span>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    section === "direcciones" ? "text-primary" : "text-foreground-secondary group-hover:translate-x-0.5"
                  )}
                />
              </button>

              <button
                type="button"
                onClick={() => setSection("facturacion")}
                className={cn(
                  "group w-full flex items-center justify-between p-3 rounded-lg transition-colors",
                  section === "facturacion"
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-secondary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-normal">Datos de facturación</span>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    section === "facturacion" ? "text-primary" : "text-foreground-secondary group-hover:translate-x-0.5"
                  )}
                />
              </button>
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

        {/* Right Column - Selected Section */}
        <div className="lg:col-span-2">
          {section === "direcciones" && tokens?.accessToken && (
            <AddressesSection
              accessToken={tokens.accessToken}
              userFullName={user.fullName}
              userPhone={user.phone}
            />
          )}
          {section === "facturacion" && tokens?.accessToken && (
            <InvoiceProfilesSection
              accessToken={tokens.accessToken}
              userEmail={user.email}
              userPhone={user.phone}
              userFullName={user.fullName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
