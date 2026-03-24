"use client";

import { useState } from "react";
import { User, Mail, Lock, Phone, Loader2, LogIn, UserPlus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore, type User as UserType } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

type AuthMode = "options" | "login" | "register";

interface CheckoutAuthProps {
  onGuestCheckout: () => void;
  onAuthenticated: (user: UserType) => void;
}

export function CheckoutAuth({ onGuestCheckout, onAuthenticated }: CheckoutAuthProps) {
  const [mode, setMode] = useState<AuthMode>("options");
  const [error, setError] = useState<string | null>(null);
  const { login, register, isLoading } = useAuthStore();

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
      const user = useAuthStore.getState().user;
      if (user) onAuthenticated(user);
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
      const user = useAuthStore.getState().user;
      if (user) onAuthenticated(user);
    } else {
      setError(result.error || "Error al crear la cuenta");
    }
  };

  // Options view
  if (mode === "options") {
    return (
      <div className="bg-background rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-medium">Datos del cliente</h2>
            <p className="text-sm text-foreground-secondary">
              Elige cómo deseas continuar
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Login option */}
          <button
            onClick={() => setMode("login")}
            className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-primary" />
              <div>
                <p className="font-normal">Iniciar sesión</p>
                <p className="text-sm text-foreground-secondary">
                  Ya tengo una cuenta
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-foreground-secondary" />
          </button>

          {/* Register option */}
          <button
            onClick={() => setMode("register")}
            className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-primary" />
              <div>
                <p className="font-normal">Crear cuenta</p>
                <p className="text-sm text-foreground-secondary">
                  Registrarme para futuras compras
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-foreground-secondary" />
          </button>

          {/* Guest option */}
          <button
            onClick={onGuestCheckout}
            className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-foreground-secondary" />
              <div>
                <p className="font-normal">Continuar como invitado</p>
                <p className="text-sm text-foreground-secondary">
                  Sin crear cuenta
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-foreground-secondary" />
          </button>
        </div>
      </div>
    );
  }

  // Login view
  if (mode === "login") {
    return (
      <div className="bg-background rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setMode("options")}
            className="text-foreground-secondary hover:text-foreground transition-colors"
          >
            ← Volver
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-medium">Iniciar sesión</h2>
          <p className="text-sm text-foreground-secondary">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="loginEmail" className="block text-sm font-normal mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
              <input
                type="email"
                id="loginEmail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={cn(inputClassName, "pl-10")}
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="loginPassword" className="block text-sm font-normal mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
              <input
                type="password"
                id="loginPassword"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={cn(inputClassName, "pl-10")}
                placeholder="Tu contraseña"
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
              onClick={() => setMode("register")}
              className="text-primary hover:underline font-normal"
            >
              Regístrate aquí
            </button>
          </p>
        </form>
      </div>
    );
  }

  // Register view
  return (
    <div className="bg-background rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setMode("options")}
          className="text-foreground-secondary hover:text-foreground transition-colors"
        >
          ← Volver
        </button>
      </div>

      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-medium">Crear cuenta</h2>
        <p className="text-sm text-foreground-secondary">
          Completa tus datos para registrarte
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="registerName" className="block text-sm font-normal mb-2">
            Nombre completo <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
            <input
              type="text"
              id="registerName"
              value={registerData.name}
              onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
              className={cn(inputClassName, "pl-10")}
              placeholder="Tu nombre"
            />
          </div>
        </div>

        <div>
          <label htmlFor="registerEmail" className="block text-sm font-normal mb-2">
            Correo electrónico <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
            <input
              type="email"
              id="registerEmail"
              value={registerData.email}
              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              className={cn(inputClassName, "pl-10")}
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="registerPhone" className="block text-sm font-normal mb-2">
            Teléfono <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
            <input
              type="tel"
              id="registerPhone"
              value={registerData.phone}
              onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              className={cn(inputClassName, "pl-10")}
              placeholder="+593 99 999 9999"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="registerPassword" className="block text-sm font-normal mb-2">
              Contraseña <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
              <input
                type="password"
                id="registerPassword"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className={cn(inputClassName, "pl-10")}
                placeholder="Min. 6 caracteres"
              />
            </div>
          </div>

          <div>
            <label htmlFor="registerConfirmPassword" className="block text-sm font-normal mb-2">
              Confirmar <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
              <input
                type="password"
                id="registerConfirmPassword"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                className={cn(inputClassName, "pl-10")}
                placeholder="Repite contraseña"
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
            onClick={() => setMode("login")}
            className="text-primary hover:underline font-normal"
          >
            Inicia sesión
          </button>
        </p>
      </form>
    </div>
  );
}
