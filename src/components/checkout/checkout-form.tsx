"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Building2, Gift, User, LogOut, Check, LogIn, UserPlus, ChevronRight, MapPin, Plus, Bookmark, AlertTriangle, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import dynamic from "next/dynamic";
import { OrderSummary } from "./order-summary";

const MapPicker = dynamic(() => import("./map-picker").then(m => ({ default: m.MapPicker })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] rounded-lg border border-border bg-secondary/30 flex items-center justify-center">
      <span className="text-sm text-foreground-secondary">Cargando mapa...</span>
    </div>
  ),
});
import { CheckoutSuccess } from "./checkout-success";
import { AuthModal } from "@/components/auth-modal";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useAddressesStore, type DeliveryAddress } from "@/stores/addresses-store";
import { useCheckoutData } from "@/hooks/use-checkout-data";

import { previewOrderAction, createOrderAction } from "@/actions/order-actions";
import type { Order, OrderPreview, BankAccount, DeliveryZone } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";

interface FormData {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  cityId: string;
  branchId: string;
  deliveryZoneId: string;
  deliveryDate: string;
  deliveryTimeSlotId: string;
  deliveryReference: string;
  occasionId: string;
  isSurprise: boolean;
  differentBuyer: boolean;
  paymentMethod: string;
  latitude: number;
  longitude: number;
}

const initialFormData: FormData = {
  senderName: "",
  senderEmail: "",
  senderPhone: "",
  recipientName: "",
  recipientPhone: "",
  address: "",
  cityId: "",
  branchId: "",
  deliveryZoneId: "",
  deliveryDate: "",
  deliveryTimeSlotId: "",
  deliveryReference: "",
  occasionId: "",
  isSurprise: true,
  differentBuyer: false,
  paymentMethod: "",
  latitude: -0.95,
  longitude: -80.73,
};

// Normalize phone to E.164 format (Ecuador default)
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Already has country code
  if (digits.startsWith("593") && digits.length >= 12) return `+${digits}`;
  // Local format starting with 0 (e.g. 0987654321)
  if (digits.startsWith("0") && digits.length === 10) return `+593${digits.slice(1)}`;
  // Without leading 0 (e.g. 987654321)
  if (digits.length === 9 && digits.startsWith("9")) return `+593${digits}`;
  // Already has + prefix
  if (phone.startsWith("+")) return phone.replace(/\s/g, "");
  return phone.replace(/\s/g, "");
}

const paymentMethods = [
  {
    value: "bank_transfer",
    label: "Transferencia bancaria",
    icon: Building2,
    available: true,
  },
  {
    value: "datafast",
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
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState("Casa");
  const [orderPreview, setOrderPreview] = useState<OrderPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [specialDateWarning, setSpecialDateWarning] = useState<string | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { items, totalPrice, clearCart } = useCartStore();
  const { user, tokens, logout } = useAuthStore();
  const { addresses, addAddress, getDefaultAddress } = useAddressesStore();

  const {
    cities,
    branches,
    zones,
    timeSlots,
    specialDates,
    bankAccounts,
    occasions,
    orderSettings,
    isLoading: isLoadingCheckoutData,
    error: checkoutDataError,
    selectedCityId,
    selectedBranchId,
    setSelectedCityId,
    setSelectedBranchId,
    getSpecialDateForDate,
    getZoneById,
  } = useCheckoutData();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-set city/branch when data loads
  useEffect(() => {
    if (selectedCityId && !formData.cityId) {
      setFormData((prev) => ({ ...prev, cityId: selectedCityId }));
    }
  }, [selectedCityId, formData.cityId]);

  useEffect(() => {
    if (selectedBranchId && !formData.branchId) {
      setFormData((prev) => ({ ...prev, branchId: selectedBranchId }));
    }
  }, [selectedBranchId, formData.branchId]);

  // Pre-fill form with user data and default address
  useEffect(() => {
    if (mounted && user) {
      setFormData((prev) => ({
        ...prev,
        senderName: prev.senderName || user.fullName,
        senderEmail: prev.senderEmail || user.email,
        senderPhone: prev.senderPhone || user.phone,
      }));

      const defaultAddress = getDefaultAddress();
      if (defaultAddress) {
        setFormData((prev) => ({
          ...prev,
          recipientName: defaultAddress.recipientName,
          recipientPhone: defaultAddress.recipientPhone,
          address: defaultAddress.address,
          deliveryReference: defaultAddress.notes || "",
        }));
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [mounted, user, getDefaultAddress]);

  // Redirect to products if cart is empty
  useEffect(() => {
    if (mounted && items.length === 0 && !isSubmitted) {
      router.push("/productos");
    }
  }, [mounted, items.length, isSubmitted, router]);

  // Check special date when delivery date changes
  useEffect(() => {
    if (formData.deliveryDate) {
      const sd = getSpecialDateForDate(formData.deliveryDate);
      if (sd && sd.warningMessage) {
        setSpecialDateWarning(sd.warningMessage);
      } else {
        setSpecialDateWarning(null);
      }

      // Validate advance days
      if (sd && sd.requiresAdvanceDays > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deliveryDate = new Date(formData.deliveryDate + "T00:00:00");
        const diffDays = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < sd.requiresAdvanceDays) {
          setError(
            `Para ${sd.name} se requiere un mínimo de ${sd.requiresAdvanceDays} días de anticipación`
          );
        }
      }
    } else {
      setSpecialDateWarning(null);
    }
  }, [formData.deliveryDate, getSpecialDateForDate]);

  // Fetch order preview with debounce
  const fetchPreview = useCallback(async () => {
    if (
      !formData.branchId ||
      !formData.deliveryZoneId ||
      !formData.deliveryDate ||
      !formData.deliveryTimeSlotId ||
      !formData.paymentMethod ||
      items.length === 0
    ) {
      setOrderPreview(null);
      return;
    }

    setIsLoadingPreview(true);
    try {
      const preview = await previewOrderAction({
        branchId: formData.branchId,
        deliveryZoneId: formData.deliveryZoneId,
        latitude: formData.latitude,
        longitude: formData.longitude,
        deliveryDate: formData.deliveryDate,
        deliveryTimeSlotId: formData.deliveryTimeSlotId,
        paymentMethod: formData.paymentMethod as "bank_transfer" | "paypal" | "datafast",
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          cardMessage: item.cardMessage,
          addOns: item.addOns?.map((a) => ({ addOnId: a.addOnId, quantity: a.quantity })),
        })),
      });
      setOrderPreview(preview);
      if (preview.warningMessage) {
        setSpecialDateWarning(preview.warningMessage);
      }
    } catch (err) {
      console.error("Error fetching preview:", err);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [formData.branchId, formData.deliveryZoneId, formData.deliveryDate, formData.deliveryTimeSlotId, formData.paymentMethod, formData.latitude, formData.longitude, items]);

  useEffect(() => {
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    previewTimeoutRef.current = setTimeout(fetchPreview, 300);
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, [fetchPreview]);

  const displayItems = mounted ? items : [];
  const subtotal = mounted ? totalPrice() : 0;

  // Determine if we should show auth section
  const showAuthSection = mounted && !user && !isGuestCheckout;

  // Get shipping cost from preview or zone
  const getShippingCost = (): number => {
    if (orderPreview) return orderPreview.deliveryFeeCents;
    if (formData.deliveryZoneId) {
      const zone = getZoneById(formData.deliveryZoneId);
      return zone?.deliveryFeeCents ?? 0;
    }
    return 0;
  };

  const shippingCost = getShippingCost();
  const transferDiscount = orderPreview?.transferDiscountCents ?? 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // Reset cascading fields
      ...(name === "cityId" ? { branchId: "", deliveryZoneId: "" } : {}),
      ...(name === "branchId" ? { deliveryZoneId: "" } : {}),
    }));
    setError(null);

    // Update checkout data hook for cascading fetches
    if (name === "cityId") {
      setSelectedCityId(value);
    }
    if (name === "branchId") {
      setSelectedBranchId(value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "cityId" ? { branchId: "", deliveryZoneId: "" } : {}),
      ...(name === "branchId" ? { deliveryZoneId: "" } : {}),
    }));
    setError(null);

    if (name === "cityId") {
      setSelectedCityId(value);
    }
    if (name === "branchId") {
      setSelectedBranchId(value);
    }
  };

  const handleMapLocationChange = useCallback((lat: number, lng: number, zone: DeliveryZone | null) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      deliveryZoneId: zone?.id ?? "",
      branchId: zone?.branchId ?? prev.branchId,
    }));

    if (zone?.branchId) {
      setSelectedBranchId(zone.branchId);
    }
    setError(null);
  }, [setSelectedBranchId]);

  const handlePaymentMethodChange = (method: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
    setError(null);
  };

  const getMinDeliveryDate = (): string => {
    const today = new Date();
    // Minimum 1 day ahead
    today.setDate(today.getDate() + 1);

    // Skip Sundays (0 = Sunday)
    if (today.getDay() === 0) {
      today.setDate(today.getDate() + 1);
    }

    return today.toISOString().split("T")[0];
  };

  const validateForm = (): boolean => {
    // Guest checkout requires sender info
    if (!user && isGuestCheckout) {
      if (!formData.senderName.trim()) {
        setError("Por favor, ingresa tu nombre");
        return false;
      }
      if (!formData.senderEmail.trim()) {
        setError("Por favor, ingresa tu correo electrónico");
        return false;
      }
      if (!formData.senderPhone.trim()) {
        setError("Por favor, ingresa tu teléfono");
        return false;
      }
    }
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
    if (!formData.cityId) {
      setError("Por favor, selecciona una ciudad");
      return false;
    }
    if (!formData.deliveryZoneId) {
      setError("Por favor, selecciona la zona de entrega");
      return false;
    }
    if (!formData.deliveryDate) {
      setError("Por favor, selecciona la fecha de entrega");
      return false;
    }
    if (!formData.deliveryTimeSlotId) {
      setError("Por favor, selecciona el horario de entrega");
      return false;
    }
    if (formData.differentBuyer) {
      if (!formData.senderName.trim()) {
        setError("Por favor, ingresa el nombre del comprador");
        return false;
      }
      if (!formData.senderPhone.trim()) {
        setError("Por favor, ingresa el teléfono del comprador");
        return false;
      }
    }
    if (!formData.paymentMethod) {
      setError("Por favor, selecciona un método de pago");
      return false;
    }

    // Validate special date advance days
    const sd = getSpecialDateForDate(formData.deliveryDate);
    if (sd && sd.requiresAdvanceDays > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deliveryDate = new Date(formData.deliveryDate + "T00:00:00");
      const diffDays = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < sd.requiresAdvanceDays) {
        setError(
          `Para ${sd.name} se requiere un mínimo de ${sd.requiresAdvanceDays} días de anticipación`
        );
        return false;
      }
    }

    return true;
  };

  const handleSelectAddress = (address: DeliveryAddress) => {
    setSelectedAddressId(address.id);
    setFormData((prev) => ({
      ...prev,
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      address: address.address,
      deliveryReference: address.notes || "",
    }));
  };

  const handleNewAddress = () => {
    setSelectedAddressId(null);
    setFormData((prev) => ({
      ...prev,
      recipientName: "",
      recipientPhone: "",
      address: "",
      deliveryReference: "",
    }));
    setSaveAddress(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Determine sender info
      const senderName = formData.differentBuyer
        ? formData.senderName
        : user?.fullName || formData.senderName;
      const senderEmail = user?.email || formData.senderEmail;
      const senderPhone = formData.differentBuyer
        ? formData.senderPhone
        : user?.phone || formData.senderPhone;

      // Get city name for the order
      const selectedCity = cities.find((c) => c.id === formData.cityId);

      const orderData = {
        branchId: formData.branchId,
        deliveryZoneId: formData.deliveryZoneId,
        latitude: formData.latitude,
        longitude: formData.longitude,
        deliveryDate: formData.deliveryDate,
        deliveryTimeSlotId: formData.deliveryTimeSlotId,
        paymentMethod: formData.paymentMethod as "bank_transfer" | "paypal" | "datafast",
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          cardMessage: item.cardMessage,
          addOns: item.addOns?.map((a) => ({ addOnId: a.addOnId, quantity: a.quantity })),
        })),
        senderName,
        senderEmail,
        senderPhone: normalizePhone(senderPhone),
        recipientName: formData.recipientName,
        recipientPhone: normalizePhone(formData.recipientPhone),
        deliveryAddress: formData.address,
        deliveryCity: selectedCity?.name || "",
        deliveryReference: formData.deliveryReference || undefined,
        occasionId: formData.occasionId || undefined,
        isSurprise: formData.isSurprise,
      };

      const guestToken = typeof window !== "undefined"
        ? localStorage.getItem("encanto-guest-token") || undefined
        : undefined;
      const order = await createOrderAction(
        orderData,
        tokens?.accessToken,
        guestToken
      );

      // Save guest token if returned
      if (order.guestToken) {
        localStorage.setItem("encanto-guest-token", order.guestToken);
      }

      // Save address if checkbox is checked and it's a new address
      if (saveAddress && !selectedAddressId && user) {
        addAddress({
          label: addressLabel,
          recipientName: formData.recipientName,
          recipientPhone: formData.recipientPhone,
          address: formData.address,
          city: selectedCity?.name || "",
          zone: zones.find((z) => z.id === formData.deliveryZoneId)?.zoneName || "",
          notes: formData.deliveryReference || undefined,
          isDefault: addresses.length === 0,
        });
      }

      setCreatedOrder(order);
      clearCart();
      setIsSubmitted(true);
    } catch (err) {
      if (err instanceof Error) {
        // Server Actions serialize errors - extract message
        const msg = err.message;
        if (msg && msg !== "API Error: 400 Bad Request" && !msg.startsWith("API Error:")) {
          setError(msg);
        } else {
          setError("Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.");
        }
      } else {
        setError("Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewOrder = () => {
    setIsSubmitted(false);
    setCreatedOrder(null);
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

  // Format time slot for display
  const formatTimeSlot = (startTime: string, endTime: string, label: string | null): string => {
    const formatTime = (t: string) => {
      const [h, m] = t.split(":");
      const hour = parseInt(h);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${m} ${ampm}`;
    };
    const timeRange = `${formatTime(startTime)} - ${formatTime(endTime)}`;
    return label ? `${label} (${timeRange})` : timeRange;
  };

  // Loading state
  if (!mounted || isLoadingCheckoutData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground-secondary">Cargando información de checkout...</p>
        </div>
      </div>
    );
  }

  // Error loading checkout data
  if (checkoutDataError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{checkoutDataError}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Show success view
  if (isSubmitted && createdOrder) {
    return (
      <CheckoutSuccess
        order={createdOrder}
        bankAccounts={bankAccounts}
        orderSettings={orderSettings}
        timeSlots={timeSlots}
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

  const discountLabel = orderSettings
    ? `${orderSettings.transferDiscountPercentage}% de descuento`
    : "Descuento por transferencia";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left column - Forms */}
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="space-y-8">
          {/* Auth Section */}
          {showAuthSection ? (
            <div className="bg-background rounded-xl border border-border p-6">
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
                <div className="bg-background rounded-xl border border-border p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">Conectado como {user.fullName}</p>
                        <p className="text-sm text-foreground-secondary truncate">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-foreground-secondary hover:text-destructive self-start sm:self-auto flex-shrink-0"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </Button>
                  </div>
                </div>
              )}

              {/* Guest checkout info + sender fields */}
              {isGuestCheckout && !user && (
                <div className="bg-background rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-foreground-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">Comprando como invitado</p>
                        <p className="text-sm text-foreground-secondary">
                          Completa tus datos a continuación
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

                  {/* Guest sender info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="senderName" className="block text-sm font-medium mb-2">
                        Tu nombre <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="text"
                        id="senderName"
                        name="senderName"
                        value={formData.senderName}
                        onChange={handleChange}
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <label htmlFor="senderPhone" className="block text-sm font-medium mb-2">
                        Tu teléfono <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="tel"
                        id="senderPhone"
                        name="senderPhone"
                        value={formData.senderPhone}
                        onChange={handleChange}
                        placeholder="+593 99 999 9999"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="senderEmail" className="block text-sm font-medium mb-2">
                        Tu correo electrónico <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="email"
                        id="senderEmail"
                        name="senderEmail"
                        value={formData.senderEmail}
                        onChange={handleChange}
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Form */}
              <form onSubmit={handleSubmit} className="space-y-8" id="checkout-form">
                <div className="bg-background rounded-xl border border-border p-6">
                  <h2 className="text-xl font-semibold mb-6">Información de entrega</h2>

                  {/* Saved Addresses */}
                  {addresses.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-foreground-secondary">Direcciones guardadas</h3>
                        <button
                          type="button"
                          onClick={handleNewAddress}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Nueva dirección
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {addresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectAddress(addr)}
                            className={cn(
                              "text-left p-3 border rounded-lg transition-all",
                              selectedAddressId === addr.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{addr.label}</span>
                                  {addr.isDefault && (
                                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                      Predeterminada
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-foreground-secondary truncate">
                                  {addr.recipientName}
                                </p>
                                <p className="text-xs text-foreground-muted truncate">
                                  {addr.address}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Recipient info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="recipientName" className="block text-sm font-medium mb-2">
                          Nombre del destinatario <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="text"
                          id="recipientName"
                          name="recipientName"
                          value={formData.recipientName}
                          onChange={handleChange}
                          placeholder="¿Quién recibe las flores?"
                        />
                      </div>
                      <div>
                        <label htmlFor="recipientPhone" className="block text-sm font-medium mb-2">
                          Teléfono del destinatario <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="tel"
                          id="recipientPhone"
                          name="recipientPhone"
                          value={formData.recipientPhone}
                          onChange={handleChange}
                          placeholder="+593 99 999 9999"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium mb-2">
                        Dirección de entrega <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Calle, número, edificio, referencia..."
                      />
                    </div>

                    {/* City and Branch */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cityId" className="block text-sm font-medium mb-2">
                          Ciudad <span className="text-destructive">*</span>
                        </label>
                        <Select value={formData.cityId} onValueChange={(v) => handleSelectChange("cityId", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una ciudad" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={city.id}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Branch selector - only show if multiple branches */}
                      {branches.length > 1 && (
                        <div>
                          <label htmlFor="branchId" className="block text-sm font-medium mb-2">
                            Sucursal <span className="text-destructive">*</span>
                          </label>
                          <Select value={formData.branchId} onValueChange={(v) => handleSelectChange("branchId", v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una sucursal" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                    </div>

                    {/* Delivery zone selector */}
                    {zones.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Zona de entrega <span className="text-destructive">*</span>
                        </label>
                        <Select value={formData.deliveryZoneId} onValueChange={(v) => handleSelectChange("deliveryZoneId", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una zona" />
                          </SelectTrigger>
                          <SelectContent>
                            {zones.map((zone) => (
                              <SelectItem key={zone.id} value={zone.id}>
                                {zone.zoneName} — {formatPrice(zone.deliveryFeeCents)}
                                {zone.estimatedMinutes ? ` (~${zone.estimatedMinutes} min)` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Map Picker - shows zones and detects location */}
                    <MapPicker
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onLocationChange={handleMapLocationChange}
                      zones={zones}
                    />

                    {/* Delivery date and time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="deliveryDate" className="block text-sm font-medium mb-2">
                          Fecha de entrega <span className="text-destructive">*</span>
                        </label>
                        <DatePicker
                          value={formData.deliveryDate ? new Date(formData.deliveryDate + "T00:00:00") : undefined}
                          onChange={(date) => {
                            const dateStr = date ? date.toISOString().split("T")[0] : "";
                            handleSelectChange("deliveryDate", dateStr);
                          }}
                          minDate={new Date(getMinDeliveryDate() + "T00:00:00")}
                          placeholder="Selecciona una fecha"
                        />
                      </div>
                      <div>
                        <label htmlFor="deliveryTimeSlotId" className="block text-sm font-medium mb-2">
                          Horario de entrega <span className="text-destructive">*</span>
                        </label>
                        <Select value={formData.deliveryTimeSlotId} onValueChange={(v) => handleSelectChange("deliveryTimeSlotId", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un horario" />
                          </SelectTrigger>
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

                    {/* Special date warning */}
                    {specialDateWarning && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">{specialDateWarning}</p>
                      </div>
                    )}

                    {/* Occasion */}
                    {occasions.length > 0 && (
                      <div>
                        <label htmlFor="occasionId" className="block text-sm font-medium mb-2">
                          Ocasión
                        </label>
                        <Select value={formData.occasionId} onValueChange={(v) => handleSelectChange("occasionId", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una ocasión (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {occasions.map((occasion) => (
                              <SelectItem key={occasion.id} value={occasion.id}>
                                {occasion.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Reference / Notes */}
                    <div>
                      <label htmlFor="deliveryReference" className="block text-sm font-medium mb-2">
                        Referencia de ubicación
                      </label>
                      <Textarea
                        id="deliveryReference"
                        name="deliveryReference"
                        value={formData.deliveryReference}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Instrucciones especiales, referencias de ubicación..."
                      />
                    </div>

                    {/* Save Address Option - only show for new addresses when logged in */}
                    {!selectedAddressId && user && (
                      <div className="p-4 bg-secondary/30 rounded-lg space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <Checkbox
                            checked={saveAddress}
                            onCheckedChange={(checked) => setSaveAddress(checked === true)}
                          />
                          <div className="flex items-center gap-2">
                            <Bookmark className="h-4 w-4 text-primary" />
                            <div>
                              <span className="text-sm font-medium">Guardar esta dirección</span>
                              <p className="text-xs text-foreground-secondary">
                                Para futuros pedidos
                              </p>
                            </div>
                          </div>
                        </label>

                        {saveAddress && (
                          <div>
                            <label htmlFor="addressLabel" className="block text-sm font-medium mb-2">
                              Etiqueta de la dirección
                            </label>
                            <Select value={addressLabel} onValueChange={setAddressLabel}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
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

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={formData.isSurprise}
                          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isSurprise: checked === true }))}
                        />
                        <div className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-primary flex-shrink-0" />
                          <div>
                            <span className="text-sm font-medium">Es una entrega sorpresa</span>
                            <p className="text-xs text-foreground-secondary">
                              No revelaremos el contenido al destinatario antes de la entrega
                            </p>
                          </div>
                        </div>
                      </label>

                      {user && (
                        <label className="flex items-center gap-3 cursor-pointer">
                          <Checkbox
                            checked={formData.differentBuyer}
                            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, differentBuyer: checked === true }))}
                          />
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium">El comprador es diferente al usuario de la cuenta</span>
                              <p className="text-xs text-foreground-secondary">
                                Agrega los datos del comprador
                              </p>
                            </div>
                          </div>
                        </label>
                      )}
                    </div>

                    {/* Buyer info (conditional) */}
                    {formData.differentBuyer && user && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
                        <div>
                          <label htmlFor="senderName" className="block text-sm font-medium mb-2">
                            Nombre del comprador <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="text"
                            id="senderName"
                            name="senderName"
                            value={formData.senderName}
                            onChange={handleChange}
                            placeholder="Nombre completo"
                          />
                        </div>
                        <div>
                          <label htmlFor="senderPhone" className="block text-sm font-medium mb-2">
                            Teléfono del comprador <span className="text-destructive">*</span>
                          </label>
                          <Input
                            type="tel"
                            id="senderPhone"
                            name="senderPhone"
                            value={formData.senderPhone}
                            onChange={handleChange}
                            placeholder="+593 99 999 9999"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-background rounded-xl border border-border p-6">
                  <h2 className="text-xl font-semibold mb-6">Método de pago</h2>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const isTransfer = method.value === "bank_transfer";
                      const description = isTransfer && orderSettings
                        ? `${orderSettings.transferDiscountPercentage}% de descuento por transferencia`
                        : method.description || "";

                      return (
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
                            {isTransfer && orderSettings && (
                              <span className="ml-2 inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                <Percent className="h-3 w-3" />
                                {discountLabel}
                              </span>
                            )}
                            {description && (
                              <p className="text-sm text-foreground-secondary">{description}</p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Bank accounts info when transfer selected */}
                  {formData.paymentMethod === "bank_transfer" && bankAccounts.length > 0 && (
                    <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
                      <h3 className="text-sm font-medium mb-3">Cuentas para transferencia</h3>
                      <div className="space-y-3">
                        {bankAccounts.map((account) => (
                          <BankAccountCard key={account.id} account={account} />
                        ))}
                      </div>
                      <p className="text-xs text-foreground-secondary mt-3">
                        Después de realizar el pedido, podrás subir el comprobante de pago.
                      </p>
                    </div>
                  )}
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
            subtotal={orderPreview?.subtotalCents ?? subtotal}
            shippingCost={shippingCost}
            transferDiscount={transferDiscount}
            isLoadingPreview={isLoadingPreview}
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

// Bank Account Card sub-component
function BankAccountCard({ account }: { account: BankAccount }) {
  const accountTypeLabel = account.accountType === "savings" ? "Ahorros" : "Corriente";

  return (
    <div className="p-3 bg-background rounded-lg border border-border text-sm">
      <p className="font-medium">{account.bankName}</p>
      <p className="text-foreground-secondary">
        {accountTypeLabel} — {account.accountNumber}
      </p>
      <p className="text-foreground-secondary">
        {account.beneficiary}
      </p>
      <p className="text-foreground-secondary">
        {account.documentType === "cedula" ? "C.I." : "RUC"}: {account.documentNumber}
      </p>
    </div>
  );
}
