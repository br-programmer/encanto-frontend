"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Banknote, Building2, Gift, User, LogOut, Check, LogIn, UserPlus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderSummary } from "./order-summary";
import { CheckoutSuccess } from "./checkout-success";
import { AuthModal } from "@/components/auth-modal";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface FormData {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  address: string;
  city: string;
  zone: string;
  deliveryDate: string;
  deliveryTime: string;
  notes: string;
  isSurprise: boolean;
  differentBuyer: boolean;
  buyerName: string;
  buyerPhone: string;
  paymentMethod: string;
}

const initialFormData: FormData = {
  recipientName: "",
  recipientPhone: "",
  recipientEmail: "",
  address: "",
  city: "manta",
  zone: "",
  deliveryDate: "",
  deliveryTime: "",
  notes: "",
  isSurprise: false,
  differentBuyer: false,
  buyerName: "",
  buyerPhone: "",
  paymentMethod: "",
};

const cities = [
  { value: "manta", label: "Manta" },
];

const zones: Record<string, { value: string; label: string; shippingCost: number }[]> = {
  manta: [
    { value: "centro", label: "Centro de Manta", shippingCost: 300 },
    { value: "tarqui", label: "Tarqui", shippingCost: 400 },
    { value: "los-esteros", label: "Los Esteros", shippingCost: 400 },
    { value: "el-murcielago", label: "El Murciélago", shippingCost: 400 },
    { value: "barbasquillo", label: "Barbasquillo", shippingCost: 500 },
    { value: "umina", label: "Umiña", shippingCost: 500 },
    { value: "otro", label: "Otra zona", shippingCost: 500 },
  ],
};

const deliveryTimes = [
  { value: "morning", label: "Mañana (9:00 AM - 12:00 PM)" },
  { value: "noon", label: "Mediodía (12:00 PM - 3:00 PM)" },
  { value: "afternoon", label: "Tarde (3:00 PM - 7:00 PM)" },
];

const paymentMethods = [
  {
    value: "transfer",
    label: "Transferencia bancaria",
    description: "Te enviaremos los datos bancarios por WhatsApp",
    icon: Building2,
    available: true,
  },
  {
    value: "cash",
    label: "Efectivo contra entrega",
    description: "Solo disponible en Manta",
    icon: Banknote,
    available: true,
  },
  {
    value: "card",
    label: "Tarjeta de crédito/débito",
    description: "Próximamente",
    icon: CreditCard,
    available: false,
  },
];

export function CheckoutForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [submittedData, setSubmittedData] = useState<{
    items: typeof items;
    subtotal: number;
    shippingCost: number;
    orderDetails: FormData;
  } | null>(null);

  const { items, totalPrice, clearCart } = useCartStore();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill form with user data when logged in
  useEffect(() => {
    if (mounted && user) {
      setFormData((prev) => ({
        ...prev,
        recipientEmail: user.email || prev.recipientEmail,
        // If user has saved address, use it
        address: user.address || prev.address,
        city: user.city || prev.city,
        zone: user.zone || prev.zone,
      }));
    }
  }, [mounted, user]);

  // Redirect to products if cart is empty
  useEffect(() => {
    if (mounted && items.length === 0 && !isSubmitted) {
      router.push("/productos");
    }
  }, [mounted, items.length, isSubmitted, router]);

  const displayItems = mounted ? items : [];
  const subtotal = mounted ? totalPrice() : 0;

  // Determine if we should show auth section
  const showAuthSection = mounted && !user && !isGuestCheckout;

  // Calculate shipping cost based on selected zone
  const getShippingCost = (): number => {
    if (!formData.city || !formData.zone) return 0;
    const cityZones = zones[formData.city];
    if (!cityZones) return 0;
    const selectedZone = cityZones.find((z) => z.value === formData.zone);
    return selectedZone?.shippingCost ?? 0;
  };

  const shippingCost = getShippingCost();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // Reset zone when city changes
      ...(name === "city" ? { zone: "" } : {}),
    }));
    setError(null);
  };

  const handlePaymentMethodChange = (method: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
    setError(null);
  };

  const getMinDeliveryDate = (): string => {
    const today = new Date();
    const hour = today.getHours();

    // If it's past 2 PM, minimum delivery is tomorrow
    if (hour >= 14) {
      today.setDate(today.getDate() + 1);
    }

    // Skip Sundays (0 = Sunday)
    if (today.getDay() === 0) {
      today.setDate(today.getDate() + 1);
    }

    return today.toISOString().split("T")[0];
  };

  const validateForm = (): boolean => {
    if (!formData.recipientName.trim()) {
      setError("Por favor, ingresa el nombre del destinatario");
      return false;
    }
    if (!formData.recipientPhone.trim()) {
      setError("Por favor, ingresa el teléfono del destinatario");
      return false;
    }
    if (!formData.address.trim()) {
      setError("Por favor, ingresa la dirección de entrega");
      return false;
    }
    if (!formData.zone) {
      setError("Por favor, selecciona la zona de entrega");
      return false;
    }
    if (!formData.deliveryDate) {
      setError("Por favor, selecciona la fecha de entrega");
      return false;
    }
    if (!formData.deliveryTime) {
      setError("Por favor, selecciona el horario de entrega");
      return false;
    }
    if (formData.differentBuyer && !formData.buyerName.trim()) {
      setError("Por favor, ingresa el nombre del comprador");
      return false;
    }
    if (formData.differentBuyer && !formData.buyerPhone.trim()) {
      setError("Por favor, ingresa el teléfono del comprador");
      return false;
    }
    if (!formData.paymentMethod) {
      setError("Por favor, selecciona un método de pago");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store submitted data before clearing cart
      setSubmittedData({
        items: [...items],
        subtotal,
        shippingCost,
        orderDetails: { ...formData },
      });

      // Clear cart and show success
      clearCart();
      setIsSubmitted(true);
    } catch {
      setError("Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewOrder = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    setFormData(initialFormData);
    router.push("/productos");
  };

  const handleGuestCheckout = () => {
    setIsGuestCheckout(true);
  };

  const handleOpenLogin = () => {
    setAuthModalMode("login");
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthModalMode("register");
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setIsGuestCheckout(false);
  };

  // Show loading state while checking cart
  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show success view
  if (isSubmitted && submittedData) {
    return (
      <CheckoutSuccess
        items={submittedData.items}
        subtotal={submittedData.subtotal}
        shippingCost={submittedData.shippingCost}
        orderDetails={{
          recipientName: submittedData.orderDetails.recipientName,
          recipientPhone: submittedData.orderDetails.recipientPhone,
          address: submittedData.orderDetails.address,
          city: cities.find((c) => c.value === submittedData.orderDetails.city)?.label || submittedData.orderDetails.city,
          zone: zones[submittedData.orderDetails.city]?.find((z) => z.value === submittedData.orderDetails.zone)?.label || submittedData.orderDetails.zone,
          deliveryDate: submittedData.orderDetails.deliveryDate,
          deliveryTime: submittedData.orderDetails.deliveryTime,
          paymentMethod: submittedData.orderDetails.paymentMethod,
          notes: submittedData.orderDetails.notes,
          isSurprise: submittedData.orderDetails.isSurprise,
        }}
        onNewOrder={handleNewOrder}
      />
    );
  }

  // Don't render form if cart is empty (will redirect)
  if (displayItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const inputClassName =
    "w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left column - Forms */}
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="space-y-8">
          {/* Auth Section */}
          {showAuthSection ? (
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Datos del cliente</h2>
                  <p className="text-sm text-foreground-secondary">
                    Elige cómo deseas continuar
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Login option */}
                <button
                  onClick={handleOpenLogin}
                  className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <LogIn className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Iniciar sesión</p>
                      <p className="text-sm text-foreground-secondary">
                        Ya tengo una cuenta
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-foreground-secondary" />
                </button>

                {/* Register option */}
                <button
                  onClick={handleOpenRegister}
                  className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Crear cuenta</p>
                      <p className="text-sm text-foreground-secondary">
                        Registrarme para futuras compras
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-foreground-secondary" />
                </button>

                {/* Guest option */}
                <button
                  onClick={handleGuestCheckout}
                  className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-foreground-secondary" />
                    <div>
                      <p className="font-medium">Continuar como invitado</p>
                      <p className="text-sm text-foreground-secondary">
                        Sin crear cuenta
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-foreground-secondary" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Logged in user info */}
              {user && (
                <div className="bg-white rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Conectado como {user.name}</p>
                        <p className="text-sm text-foreground-secondary">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-foreground-secondary hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </Button>
                  </div>
                </div>
              )}

              {/* Guest checkout info */}
              {isGuestCheckout && !user && (
                <div className="bg-white rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-foreground-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">Comprando como invitado</p>
                        <p className="text-sm text-foreground-secondary">
                          Completa los datos a continuación
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsGuestCheckout(false)}
                      className="text-primary"
                    >
                      Iniciar sesión
                    </Button>
                  </div>
                </div>
              )}

              {/* Shipping Form */}
              <form onSubmit={handleSubmit} className="space-y-8" id="checkout-form">
                <div className="bg-white rounded-xl border border-border p-6">
                  <h2 className="text-xl font-semibold mb-6">Información de entrega</h2>

                  <div className="space-y-6">
                    {/* Recipient info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="recipientName" className="block text-sm font-medium mb-2">
                          Nombre del destinatario <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          id="recipientName"
                          name="recipientName"
                          value={formData.recipientName}
                          onChange={handleChange}
                          className={inputClassName}
                          placeholder="¿Quién recibe las flores?"
                        />
                      </div>
                      <div>
                        <label htmlFor="recipientPhone" className="block text-sm font-medium mb-2">
                          Teléfono del destinatario <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="tel"
                          id="recipientPhone"
                          name="recipientPhone"
                          value={formData.recipientPhone}
                          onChange={handleChange}
                          className={inputClassName}
                          placeholder="+593 99 999 9999"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="recipientEmail" className="block text-sm font-medium mb-2">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        id="recipientEmail"
                        name="recipientEmail"
                        value={formData.recipientEmail}
                        onChange={handleChange}
                        className={inputClassName}
                        placeholder="correo@ejemplo.com (opcional)"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium mb-2">
                        Dirección de entrega <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={inputClassName}
                        placeholder="Calle, número, edificio, referencia..."
                      />
                    </div>

                    {/* City and Zone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium mb-2">
                          Ciudad <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={inputClassName}
                        >
                          {cities.map((city) => (
                            <option key={city.value} value={city.value}>
                              {city.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="zone" className="block text-sm font-medium mb-2">
                          Zona <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="zone"
                          name="zone"
                          value={formData.zone}
                          onChange={handleChange}
                          className={inputClassName}
                        >
                          <option value="">Selecciona una zona</option>
                          {(zones[formData.city] || []).map((zone) => (
                            <option key={zone.value} value={zone.value}>
                              {zone.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Delivery date and time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="deliveryDate" className="block text-sm font-medium mb-2">
                          Fecha de entrega <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="date"
                          id="deliveryDate"
                          name="deliveryDate"
                          value={formData.deliveryDate}
                          onChange={handleChange}
                          min={getMinDeliveryDate()}
                          className={inputClassName}
                        />
                      </div>
                      <div>
                        <label htmlFor="deliveryTime" className="block text-sm font-medium mb-2">
                          Horario de entrega <span className="text-destructive">*</span>
                        </label>
                        <select
                          id="deliveryTime"
                          name="deliveryTime"
                          value={formData.deliveryTime}
                          onChange={handleChange}
                          className={inputClassName}
                        >
                          <option value="">Selecciona un horario</option>
                          {deliveryTimes.map((time) => (
                            <option key={time.value} value={time.value}>
                              {time.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium mb-2">
                        Notas adicionales
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className={cn(inputClassName, "resize-none")}
                        placeholder="Instrucciones especiales, dedicatoria, referencias de ubicación..."
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isSurprise"
                          checked={formData.isSurprise}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-primary" />
                          <div>
                            <span className="text-sm font-medium">Es una entrega sorpresa</span>
                            <p className="text-xs text-foreground-secondary">
                              No revelaremos el contenido al destinatario antes de la entrega
                            </p>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="differentBuyer"
                          checked={formData.differentBuyer}
                          onChange={handleChange}
                          className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <div>
                            <span className="text-sm font-medium">El comprador es diferente al destinatario</span>
                            <p className="text-xs text-foreground-secondary">
                              Agrega tus datos para que podamos contactarte
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Buyer info (conditional) */}
                    {formData.differentBuyer && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
                        <div>
                          <label htmlFor="buyerName" className="block text-sm font-medium mb-2">
                            Tu nombre <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            id="buyerName"
                            name="buyerName"
                            value={formData.buyerName}
                            onChange={handleChange}
                            className={inputClassName}
                            placeholder="Tu nombre completo"
                          />
                        </div>
                        <div>
                          <label htmlFor="buyerPhone" className="block text-sm font-medium mb-2">
                            Tu teléfono <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="tel"
                            id="buyerPhone"
                            name="buyerPhone"
                            value={formData.buyerPhone}
                            onChange={handleChange}
                            className={inputClassName}
                            placeholder="+593 99 999 9999"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl border border-border p-6">
                  <h2 className="text-xl font-semibold mb-6">Método de pago</h2>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.value}
                        className={cn(
                          "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all",
                          formData.paymentMethod === method.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50",
                          !method.available && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <input
                          type="radio"
                          name="paymentMethodRadio"
                          value={method.value}
                          checked={formData.paymentMethod === method.value}
                          onChange={() => method.available && handlePaymentMethodChange(method.value)}
                          disabled={!method.available}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <method.icon className="h-5 w-5 text-foreground-secondary flex-shrink-0" />
                        <div className="flex-1">
                          <span className="font-medium">{method.label}</span>
                          <p className="text-sm text-foreground-secondary">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Submit button - visible on mobile */}
                <div className="lg:hidden">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Confirmar pedido"
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right column - Order Summary (sticky on desktop) */}
      <div className="lg:col-span-5 xl:col-span-4">
        <div className="lg:sticky lg:top-24 space-y-4">
          <OrderSummary
            items={displayItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
          />

          {/* Submit button - visible on desktop, only when form is shown */}
          {!showAuthSection && (
            <div className="hidden lg:block">
              <Button
                type="submit"
                form="checkout-form"
                size="lg"
                className="w-full h-14 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Confirmar pedido"
                )}
              </Button>
              <p className="text-xs text-foreground-secondary text-center mt-3">
                Al confirmar, aceptas nuestras políticas de envío y devolución
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
