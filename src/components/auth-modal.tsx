"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, Mail, Lock, Phone, Loader2, LogIn, UserPlus, CheckCircle2, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showVerificationReminder, setShowVerificationReminder] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { login, register, isLoading, user } = useAuthStore();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setShowVerificationReminder(false);
      setRegisteredEmail("");
      setLoginEmail("");
      setLoginPassword("");
      setRegisterData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [isOpen, initialMode]);

  useScrollLock(isOpen);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const inputClassName =
    "w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail || !loginPassword) {
      setError("Por favor, completa todos los campos");
      return;
    }

    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Credenciales incorrectas");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registerData.name || !registerData.email || !registerData.phone || !registerData.password) {
      setError("Por favor, completa todos los campos requeridos");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (registerData.password.length < 10) {
      setError("La contraseña debe tener al menos 10 caracteres");
      return;
    }

    const result = await register({
      fullName: registerData.name,
      email: registerData.email,
      phone: registerData.phone,
      password: registerData.password,
    });

    if (result.success) {
      // Check if email verification is needed
      const currentUser = useAuthStore.getState().user;
      if (currentUser && !currentUser.emailVerified) {
        setRegisteredEmail(registerData.email);
        setShowVerificationReminder(true);
      } else {
        onClose();
      }
    } else {
      setError(result.error || "Error al crear la cuenta");
    }
  };

  // Don't render on server or if not open
  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Container - centers the modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
        {/* Modal */}
        <div
          className="relative w-full max-w-md bg-background rounded-xl shadow-xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 text-foreground-secondary hover:text-foreground transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Verification Reminder Screen */}
          {showVerificationReminder ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MailOpen className="h-10 w-10 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">¡Cuenta creada!</h2>
              <p className="text-foreground-secondary mb-4">
                Hemos enviado un correo de verificación a:
              </p>
              <p className="font-medium text-primary mb-6">{registeredEmail}</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-amber-800">
                  <strong>Importante:</strong> Revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta completamente.
                </p>
              </div>
              <Button onClick={onClose} className="w-full" size="lg">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Entendido
              </Button>
              <p className="text-xs text-foreground-muted mt-4">
                ¿No recibiste el correo? Revisa tu carpeta de spam.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center pt-8 pb-6 px-6">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  {mode === "login" ? (
                    <LogIn className="h-8 w-8 text-primary" />
                  ) : (
                    <UserPlus className="h-8 w-8 text-primary" />
                  )}
                </div>
                <h2 className="text-xl font-semibold">
                  {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
                </h2>
                <p className="text-sm text-foreground-secondary mt-1">
                  {mode === "login"
                    ? "Ingresa tus credenciales para continuar"
                    : "Completa tus datos para registrarte"}
            </p>
          </div>

          {/* Form */}
          <div className="px-6 pb-8">
            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="modal-loginEmail" className="block text-sm font-medium mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    <input
                      type="email"
                      id="modal-loginEmail"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className={cn(inputClassName, "pl-10")}
                      placeholder="tu@email.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="modal-loginPassword" className="block text-sm font-medium mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    <input
                      type="password"
                      id="modal-loginPassword"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className={cn(inputClassName, "pl-10")}
                      placeholder="Tu contraseña"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>

                <p className="text-center text-sm text-foreground-secondary">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setError(null);
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Regístrate aquí
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="modal-registerName" className="block text-sm font-medium mb-2">
                    Nombre completo <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    <input
                      type="text"
                      id="modal-registerName"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className={cn(inputClassName, "pl-10")}
                      placeholder="Tu nombre"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="modal-registerEmail" className="block text-sm font-medium mb-2">
                    Correo electrónico <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    <input
                      type="email"
                      id="modal-registerEmail"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className={cn(inputClassName, "pl-10")}
                      placeholder="tu@email.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="modal-registerPhone" className="block text-sm font-medium mb-2">
                    Teléfono <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                    <input
                      type="tel"
                      id="modal-registerPhone"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className={cn(inputClassName, "pl-10")}
                      placeholder="+593 99 999 9999"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="modal-registerPassword" className="block text-sm font-medium mb-2">
                      Contraseña <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                      <input
                        type="password"
                        id="modal-registerPassword"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className={cn(inputClassName, "pl-10")}
                        placeholder="Min. 10"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="modal-registerConfirmPassword" className="block text-sm font-medium mb-2">
                      Confirmar <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
                      <input
                        type="password"
                        id="modal-registerConfirmPassword"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className={cn(inputClassName, "pl-10")}
                        placeholder="Repite"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear cuenta"
                  )}
                </Button>

                <p className="text-center text-sm text-foreground-secondary">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Inicia sesión
                  </button>
                </p>
              </form>
            )}
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modalContent, document.body);
}
