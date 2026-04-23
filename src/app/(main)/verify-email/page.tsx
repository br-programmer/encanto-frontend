"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

import { verifyEmailAction } from "@/actions/auth-actions";
import { claimAllGuestResources, useAuthStore } from "@/stores/auth-store";

type VerificationStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus("error");
        setErrorMessage("No se proporcionó un token de verificación");
        return;
      }

      try {
        await verifyEmailAction(token);
        setStatus("success");
        // If the user is logged in, refresh and claim guest resources
        // (service-requests claim requires verified email, now satisfied)
        const accessToken = useAuthStore.getState().tokens?.accessToken;
        if (accessToken) {
          try {
            await claimAllGuestResources(accessToken, { emailVerified: true });
            await useAuthStore.getState().fetchUser();
          } catch { /* non-critical */ }
        }
      } catch (error) {
        setStatus("error");
        if (error instanceof Error && error.message.includes("400")) {
          setErrorMessage("El enlace de verificación es inválido o ha expirado");
        } else {
          setErrorMessage("Ha ocurrido un error al verificar tu correo");
        }
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md mx-auto">
        {status === "loading" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-medium mb-2">Verificando tu correo</h1>
            <p className="text-foreground-secondary">
              Por favor espera mientras verificamos tu dirección de correo electrónico...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-medium mb-2">Correo verificado</h1>
            <p className="text-foreground-secondary mb-8">
              Tu dirección de correo electrónico ha sido verificada exitosamente.
              Ahora puedes disfrutar de todas las funcionalidades de tu cuenta.
            </p>
            <div className="space-y-3">
              <Link href="/productos">
                <Button size="lg" className="w-full">
                  Explorar productos
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full">
                  Ir al inicio
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-medium mb-2">Error de verificación</h1>
            <p className="text-foreground-secondary mb-4">
              {errorMessage}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
              <p className="text-sm text-amber-800">
                <strong>Posibles causas:</strong>
              </p>
              <ul className="text-sm text-amber-800 mt-2 list-disc list-inside space-y-1">
                <li>El enlace ha expirado (válido por 24 horas)</li>
                <li>El enlace ya fue utilizado</li>
                <li>El enlace está incompleto o dañado</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Link href="/">
                <Button size="lg" className="w-full">
                  <Mail className="h-5 w-5 mr-2" />
                  Ir al inicio
                </Button>
              </Link>
              <p className="text-sm text-foreground-secondary">
                Si el problema persiste, inicia sesión y solicita un nuevo correo de verificación.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
