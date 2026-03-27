"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, User, LogIn, UserPlus, Check, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckoutProgress } from "./checkout-progress";
import { OrderSummary } from "./order-summary";
import { CheckoutSuccess } from "./checkout-success";
import { PayPalCheckoutModal } from "./paypal-checkout";
import { AddOnsModal } from "./add-ons-modal";
import { AuthModal } from "@/components/auth-modal";
import { PhoneInput, normalizePhoneValue } from "@/components/ui/phone-input";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useAddressesStore, type DeliveryAddress } from "@/stores/addresses-store";
import { useCheckoutData } from "@/hooks/use-checkout-data";
import { StepDelivery } from "./steps/step-delivery";
import { StepSchedule } from "./steps/step-schedule";
import { StepPayment } from "./steps/step-payment";
import { StepReview } from "./steps/step-review";

import { previewOrderAction, createOrderAction } from "@/actions/order-actions";
import type { Order, OrderPreview, BankAccount, DeliveryZone, FulfillmentType } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";

interface FormData {
  fulfillmentType: FulfillmentType;
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
  isAnonymous: boolean;
  differentBuyer: boolean;
  paymentMethod: string;
  latitude: number;
  longitude: number;
}

const initialFormData: FormData = {
  fulfillmentType: "delivery",
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
  isAnonymous: false,
  differentBuyer: false,
  paymentMethod: "",
  latitude: -0.95,
  longitude: -80.73,
};

const CHECKOUT_STORAGE_KEY = "encanto-checkout-form";
const CHECKOUT_STEP_KEY = "encanto-checkout-step";

function getSavedFormData(): FormData | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as FormData;
  } catch { return null; }
}

function saveFormData(data: FormData) {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data)); } catch {}
}

function clearSavedFormData() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
  sessionStorage.removeItem(CHECKOUT_STEP_KEY);
}

function getSavedStep(): number {
  if (typeof window === "undefined") return 1;
  try { return parseInt(sessionStorage.getItem(CHECKOUT_STEP_KEY) || "1", 10) || 1; } catch { return 1; }
}

function saveStep(step: number) {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(CHECKOUT_STEP_KEY, String(step)); } catch {}
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Transferencia bancaria",
  paypal: "PayPal",
  datafast: "Tarjeta de crédito/débito",
};

export function CheckoutForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
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
  const [pendingPayPal, setPendingPayPal] = useState(false);
  const [paypalTokens, setPaypalTokens] = useState<{ accessToken?: string; guestToken?: string }>({});
  const [specialDateWarning, setSpecialDateWarning] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountAmountCents, setDiscountAmountCents] = useState(0);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [addOnsModalProductId, setAddOnsModalProductId] = useState<string | null>(null);

  const { items, totalPrice, clearCart, updateItemCardMessage, updateItemAddOns } = useCartStore();
  const { user, tokens, logout } = useAuthStore();
  const { addresses, addAddress, getDefaultAddress } = useAddressesStore();

  const {
    cities, branches, zones, timeSlots, specialDates, bankAccounts, occasions, orderSettings,
    addOnCategories, addOns: availableAddOns,
    isLoading: isLoadingCheckoutData, error: checkoutDataError,
    selectedCityId, selectedBranchId, setSelectedCityId, setSelectedBranchId,
    getSpecialDateForDate, getZoneById,
  } = useCheckoutData();

  // Mount + restore
  useEffect(() => {
    setMounted(true);
    const saved = getSavedFormData();
    if (saved) {
      setFormData(saved);
      if (saved.cityId) setSelectedCityId(saved.cityId);
      if (saved.branchId) setSelectedBranchId(saved.branchId);
    }
    setCurrentStep(getSavedStep());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist
  useEffect(() => { if (mounted) saveFormData(formData); }, [mounted, formData]);
  useEffect(() => { if (mounted) saveStep(currentStep); }, [mounted, currentStep]);

  // Auto-set city/branch
  useEffect(() => { if (selectedCityId && !formData.cityId) setFormData((p) => ({ ...p, cityId: selectedCityId })); }, [selectedCityId, formData.cityId]);
  useEffect(() => { if (selectedBranchId && !formData.branchId) setFormData((p) => ({ ...p, branchId: selectedBranchId })); }, [selectedBranchId, formData.branchId]);

  // Pre-fill user data
  useEffect(() => {
    if (mounted && user) {
      setFormData((p) => ({
        ...p,
        senderName: p.senderName || user.fullName,
        senderEmail: p.senderEmail || user.email,
        senderPhone: p.senderPhone || user.phone,
      }));
      const defaultAddress = getDefaultAddress();
      if (defaultAddress) {
        setFormData((p) => ({
          ...p,
          recipientName: defaultAddress.recipientName,
          recipientPhone: defaultAddress.recipientPhone,
          address: defaultAddress.address,
          deliveryReference: defaultAddress.notes || "",
        }));
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [mounted, user, getDefaultAddress]);

  // Redirect if cart empty
  useEffect(() => {
    if (mounted && items.length === 0 && !isSubmitted && !pendingPayPal) router.push("/productos");
  }, [mounted, items.length, isSubmitted, pendingPayPal, router]);

  // Special date check
  useEffect(() => {
    if (formData.deliveryDate) {
      const sd = getSpecialDateForDate(formData.deliveryDate);
      setSpecialDateWarning(sd?.warningMessage || null);
      if (sd && sd.requiresAdvanceDays > 0) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const deliveryDate = new Date(formData.deliveryDate + "T00:00:00");
        const diffDays = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < sd.requiresAdvanceDays) {
          setError(`Para ${sd.name} se requiere un mínimo de ${sd.requiresAdvanceDays} días de anticipación`);
        }
      }
    } else { setSpecialDateWarning(null); }
  }, [formData.deliveryDate, getSpecialDateForDate]);

  const isPickup = formData.fulfillmentType === "pickup";

  // Preview
  const fetchPreview = useCallback(async () => {
    const needsZone = formData.fulfillmentType === "delivery";
    if (!formData.branchId || (needsZone && !formData.deliveryZoneId) || !formData.deliveryDate || !formData.deliveryTimeSlotId || !formData.paymentMethod || items.length === 0) {
      setOrderPreview(null); return;
    }
    setIsLoadingPreview(true);
    try {
      const preview = await previewOrderAction({
        fulfillmentType: formData.fulfillmentType, branchId: formData.branchId,
        ...(needsZone ? { deliveryZoneId: formData.deliveryZoneId, latitude: formData.latitude, longitude: formData.longitude } : {}),
        deliveryDate: formData.deliveryDate, deliveryTimeSlotId: formData.deliveryTimeSlotId,
        paymentMethod: formData.paymentMethod as "bank_transfer" | "paypal" | "datafast",
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, cardMessage: item.cardMessage, addOns: item.addOns?.map((a) => ({ addOnId: a.addOnId, quantity: a.quantity })) })),
        ...(discountCode ? { discountCode } : {}),
      });
      setOrderPreview(preview);
      if (preview.warningMessage) setSpecialDateWarning(preview.warningMessage);
    } catch (err) { console.error("Error fetching preview:", err); }
    finally { setIsLoadingPreview(false); }
  }, [formData.fulfillmentType, formData.branchId, formData.deliveryZoneId, formData.deliveryDate, formData.deliveryTimeSlotId, formData.paymentMethod, formData.latitude, formData.longitude, items, discountCode]);

  useEffect(() => {
    if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(fetchPreview, 300);
    return () => { if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current); };
  }, [fetchPreview]);

  const displayItems = mounted ? items : [];
  const subtotal = mounted ? totalPrice() : 0;
  const showAuthSection = mounted && !user && !isGuestCheckout;
  const shippingCost = isPickup ? 0 : (orderPreview?.deliveryFeeCents ?? (formData.deliveryZoneId ? (getZoneById(formData.deliveryZoneId)?.deliveryFeeCents ?? 0) : 0));
  const transferDiscount = orderPreview?.transferDiscountCents ?? 0;

  // Handlers
  const handleFormChange = (updates: Record<string, unknown>) => {
    setFormData((p) => {
      const next = { ...p, ...updates };
      if ("cityId" in updates) { next.branchId = ""; next.deliveryZoneId = ""; setSelectedCityId(updates.cityId as string); }
      if ("branchId" in updates) { next.deliveryZoneId = ""; setSelectedBranchId(updates.branchId as string); }
      return next;
    });
    setError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    handleFormChange({ [name]: value });
  };

  const handleMapLocationChange = useCallback((lat: number, lng: number, zone: DeliveryZone | null) => {
    setFormData((p) => ({ ...p, latitude: lat, longitude: lng, deliveryZoneId: zone?.id ?? "", branchId: zone?.branchId ?? p.branchId }));
    if (zone?.branchId) setSelectedBranchId(zone.branchId);
    setError(null);
  }, [setSelectedBranchId]);

  const handlePhoneChange = (name: string, value: string) => setFormData((p) => ({ ...p, [name]: value }));

  const handleSelectAddress = (address: DeliveryAddress) => {
    setSelectedAddressId(address.id);
    setFormData((p) => ({ ...p, recipientName: address.recipientName, recipientPhone: address.recipientPhone, address: address.address, deliveryReference: address.notes || "" }));
  };

  const handleNewAddress = () => {
    setSelectedAddressId(null);
    setFormData((p) => ({ ...p, recipientName: "", recipientPhone: "", address: "", deliveryReference: "" }));
    setSaveAddress(true);
  };

  const getMinDeliveryDate = (): string => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    if (today.getDay() === 0) today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  };

  const formatTimeSlot = (startTime: string, endTime: string, label: string | null): string => {
    const fmt = (t: string) => { const [h, m] = t.split(":"); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`; };
    const timeRange = `${fmt(startTime)} - ${fmt(endTime)}`;
    return label ? `${label} (${timeRange})` : timeRange;
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!formData.recipientName.trim()) { setError(isPickup ? "Ingresa el nombre de quien retira" : "Ingresa el nombre del destinatario"); return false; }
      if (!isPickup && !formData.recipientPhone.trim()) { setError("Ingresa el teléfono del destinatario"); return false; }
      if (!isPickup && !formData.address.trim()) { setError("Ingresa la dirección de entrega"); return false; }
      if (!isPickup && !formData.cityId) { setError("Selecciona una ciudad"); return false; }
      if (!isPickup && !formData.deliveryZoneId) { setError("Selecciona la zona de entrega"); return false; }
      if (!formData.branchId) { setError("Selecciona una sucursal"); return false; }
    }
    if (step === 2) {
      if (!formData.deliveryDate) { setError("Selecciona la fecha de entrega"); return false; }
      if (!formData.deliveryTimeSlotId) { setError("Selecciona el horario de entrega"); return false; }
      if (formData.differentBuyer) {
        if (!formData.senderName.trim()) { setError("Ingresa el nombre del comprador"); return false; }
        if (!formData.senderPhone.trim()) { setError("Ingresa el teléfono del comprador"); return false; }
      }
      const sd = getSpecialDateForDate(formData.deliveryDate);
      if (sd && sd.requiresAdvanceDays > 0) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const dd = new Date(formData.deliveryDate + "T00:00:00");
        if (Math.ceil((dd.getTime() - today.getTime()) / 86400000) < sd.requiresAdvanceDays) {
          setError(`Para ${sd.name} se requiere ${sd.requiresAdvanceDays} días de anticipación`); return false;
        }
      }
    }
    if (step === 3) {
      if (!formData.paymentMethod) { setError("Selecciona un método de pago"); return false; }
    }
    return true;
  };

  const goToStep = (step: number) => { setCurrentStep(step); setError(null); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps((p) => [...new Set([...p, currentStep])]);
      goToStep(currentStep + 1);
    }
  };

  const handleBack = () => { if (currentStep > 1) goToStep(currentStep - 1); };

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step) || step < currentStep) goToStep(step);
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;
    if (!user && isGuestCheckout && (!formData.senderName.trim() || !formData.senderEmail.trim() || !formData.senderPhone.trim())) {
      setError("Completa tus datos de contacto"); return;
    }

    setIsSubmitting(true); setError(null);
    try {
      const senderName = formData.differentBuyer ? formData.senderName : user?.fullName || formData.senderName;
      const senderEmail = user?.email || formData.senderEmail;
      const senderPhone = formData.differentBuyer ? formData.senderPhone : user?.phone || formData.senderPhone;
      const selectedCity = cities.find((c) => c.id === formData.cityId);

      const orderData = {
        fulfillmentType: formData.fulfillmentType, branchId: formData.branchId,
        ...(isPickup ? {} : { deliveryZoneId: formData.deliveryZoneId, latitude: formData.latitude, longitude: formData.longitude, deliveryAddress: formData.address, deliveryCity: selectedCity?.name || "", deliveryReference: formData.deliveryReference || undefined }),
        deliveryDate: formData.deliveryDate, deliveryTimeSlotId: formData.deliveryTimeSlotId,
        paymentMethod: formData.paymentMethod as "bank_transfer" | "paypal" | "datafast",
        items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity, cardMessage: item.cardMessage, addOns: item.addOns?.map((a) => ({ addOnId: a.addOnId, quantity: a.quantity })) })),
        senderName, senderEmail, senderPhone: normalizePhoneValue(senderPhone),
        recipientName: formData.recipientName,
        ...(formData.recipientPhone.trim() ? { recipientPhone: normalizePhoneValue(formData.recipientPhone) } : {}),
        occasionId: formData.occasionId || undefined,
        isSurprise: formData.isSurprise, isAnonymous: formData.isAnonymous,
        ...(discountCode ? { discountCode } : {}),
      };

      let validAccessToken: string | undefined;
      let guestToken: string | undefined;
      if (user) {
        const { getValidAccessToken } = useAuthStore.getState();
        validAccessToken = await getValidAccessToken();
        if (!validAccessToken) { setSessionExpired(true); setIsSubmitting(false); return; }
      } else {
        guestToken = typeof window !== "undefined" ? localStorage.getItem("encanto-guest-token") || undefined : undefined;
      }

      const order = await createOrderAction(orderData, validAccessToken, guestToken);
      if (order.guestToken) localStorage.setItem("encanto-guest-token", order.guestToken);

      if (saveAddress && !selectedAddressId && user) {
        addAddress({ label: addressLabel, recipientName: formData.recipientName, recipientPhone: formData.recipientPhone, address: formData.address, city: selectedCity?.name || "", zone: zones.find((z) => z.id === formData.deliveryZoneId)?.zoneName || "", notes: formData.deliveryReference || undefined, isDefault: addresses.length === 0 });
      }

      setCreatedOrder(order); clearCart(); clearSavedFormData();
      sessionStorage.setItem("encanto-order-created", "true");

      if (formData.paymentMethod === "paypal") {
        setPaypalTokens({ accessToken: validAccessToken, guestToken: order.guestToken || guestToken });
        setPendingPayPal(true);
      } else { setIsSubmitted(true); }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg && msg !== "API Error: 400 Bad Request" && !msg.startsWith("API Error:") ? msg : "Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.");
    } finally { setIsSubmitting(false); }
  };

  const handleNewOrder = () => { setIsSubmitted(false); setCreatedOrder(null); setFormData(initialFormData); clearSavedFormData(); setCurrentStep(1); setCompletedSteps([]); router.push("/productos"); };

  // Loading
  if (!mounted || isLoadingCheckoutData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  if (checkoutDataError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{checkoutDataError}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  // Success
  if (isSubmitted && createdOrder) {
    const canReopenPayPal = createdOrder.paymentMethod === "paypal" && createdOrder.paymentStatus !== "paid";
    return (
      <>
        <CheckoutSuccess order={createdOrder} bankAccounts={bankAccounts} orderSettings={orderSettings} timeSlots={timeSlots} onNewOrder={handleNewOrder} onPayPal={canReopenPayPal ? () => setPendingPayPal(true) : undefined} />
        {canReopenPayPal && (
          <PayPalCheckoutModal isOpen={pendingPayPal} onClose={() => setPendingPayPal(false)} orderId={createdOrder.id} orderNumber={createdOrder.orderNumber} totalCents={createdOrder.totalCents} accessToken={paypalTokens.accessToken} guestToken={paypalTokens.guestToken} onSuccess={(o) => { setCreatedOrder(o); setPendingPayPal(false); }} onError={(msg) => setError(msg)} />
        )}
      </>
    );
  }

  if (pendingPayPal && createdOrder) {
    return (
      <>
        <CheckoutSuccess order={createdOrder} bankAccounts={bankAccounts} orderSettings={orderSettings} timeSlots={timeSlots} onNewOrder={handleNewOrder} onPayPal={() => setPendingPayPal(true)} />
        <PayPalCheckoutModal isOpen={pendingPayPal} onClose={() => { setPendingPayPal(false); setIsSubmitted(true); }} orderId={createdOrder.id} orderNumber={createdOrder.orderNumber} totalCents={createdOrder.totalCents} accessToken={paypalTokens.accessToken} guestToken={paypalTokens.guestToken} onSuccess={(o) => { setCreatedOrder(o); setPendingPayPal(false); setIsSubmitted(true); }} onError={(msg) => setError(msg)} />
      </>
    );
  }

  if (displayItems.length === 0) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Auth gate
  if (showAuthSection) {
    return (
      <div className="py-8 sm:py-10">
        <h1 className="text-3xl sm:text-4xl font-serif text-center mb-2">Finalizar compra</h1>
        <p className="text-foreground-secondary text-center mb-8">Elige cómo deseas continuar</p>
        <div className="max-w-md mx-auto space-y-3">
          <button onClick={() => { setAuthModalMode("login"); setAuthModalOpen(true); }} className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
            <div className="flex items-center gap-3"><LogIn className="h-5 w-5 text-primary" /><div><p className="font-normal">Iniciar sesión</p><p className="text-sm text-foreground-secondary">Ya tengo una cuenta</p></div></div>
            <ChevronRight className="h-5 w-5 text-foreground-secondary" />
          </button>
          <button onClick={() => { setAuthModalMode("register"); setAuthModalOpen(true); }} className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
            <div className="flex items-center gap-3"><UserPlus className="h-5 w-5 text-primary" /><div><p className="font-normal">Crear cuenta</p><p className="text-sm text-foreground-secondary">Registrarme para futuras compras</p></div></div>
            <ChevronRight className="h-5 w-5 text-foreground-secondary" />
          </button>
          <button onClick={() => setIsGuestCheckout(true)} className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
            <div className="flex items-center gap-3"><User className="h-5 w-5 text-foreground-secondary" /><div><p className="font-normal">Continuar como invitado</p><p className="text-sm text-foreground-secondary">Sin crear cuenta</p></div></div>
            <ChevronRight className="h-5 w-5 text-foreground-secondary" />
          </button>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authModalMode} />
      </div>
    );
  }

  // Helper for review step
  const getTimeSlotLabel = () => {
    const slot = timeSlots.find((s) => s.id === formData.deliveryTimeSlotId);
    return slot ? formatTimeSlot(slot.startTime, slot.endTime, slot.displayLabel) : "";
  };

  return (
    <div>
      <div className="py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-serif text-center mb-6">Finalizar compra</h1>

        {/* User info bar */}
        {user && (
          <div className="flex items-center justify-center gap-3 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"><Check className="h-3.5 w-3.5 text-green-600" /></div>
              <span className="text-foreground-secondary truncate">{user.email}</span>
            </div>
            <button onClick={() => { logout(); setIsGuestCheckout(false); }} className="text-foreground-muted hover:text-destructive transition-colors"><LogOut className="h-4 w-4" /></button>
          </div>
        )}
        {isGuestCheckout && !user && (
          <div className="max-w-lg mx-auto mb-6 p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-normal">Tus datos de contacto</p>
              <button onClick={() => setIsGuestCheckout(false)} className="text-xs text-primary hover:underline">Iniciar sesión</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input placeholder="Tu nombre *" value={formData.senderName} onChange={(e) => handleFormChange({ senderName: e.target.value })} />
              <PhoneInput value={formData.senderPhone} onChange={(val) => handlePhoneChange("senderPhone", val)} />
              <div className="sm:col-span-2">
                <Input type="email" placeholder="Tu correo electrónico *" value={formData.senderEmail} onChange={(e) => handleFormChange({ senderEmail: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        <CheckoutProgress currentStep={currentStep} completedSteps={completedSteps} onStepClick={handleStepClick} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        <div className="lg:col-span-7 xl:col-span-8">
          {currentStep === 1 && (
            <StepDelivery
              formData={formData} onFormChange={handleFormChange} onSelectChange={handleSelectChange}
              onMapLocationChange={handleMapLocationChange} onPhoneChange={handlePhoneChange}
              cities={cities} branches={branches} zones={zones} addresses={addresses}
              selectedAddressId={selectedAddressId} onSelectAddress={handleSelectAddress} onNewAddress={handleNewAddress}
              saveAddress={saveAddress} onSaveAddressChange={setSaveAddress} addressLabel={addressLabel} onAddressLabelChange={setAddressLabel}
              user={user} isPickup={isPickup} error={error} onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <StepSchedule
              formData={formData} onFormChange={handleFormChange} onSelectChange={handleSelectChange} onPhoneChange={handlePhoneChange}
              timeSlots={timeSlots} occasions={occasions} specialDateWarning={specialDateWarning}
              minDeliveryDate={getMinDeliveryDate()} formatTimeSlot={formatTimeSlot} isPickup={isPickup} user={user}
              items={items} onUpdateCardMessage={updateItemCardMessage} onOpenAddOns={setAddOnsModalProductId} availableAddOns={availableAddOns}
              error={error} onNext={handleNext} onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <StepPayment
              paymentMethod={formData.paymentMethod} onPaymentMethodChange={(m) => handleFormChange({ paymentMethod: m })}
              bankAccounts={bankAccounts} orderSettings={orderSettings}
              subtotalCents={orderPreview?.subtotalCents ?? subtotal}
              discountCode={discountCode} discountAmountCents={discountAmountCents}
              onDiscountApply={(r) => { setDiscountCode(r.code); setDiscountAmountCents(r.discountAmountCents); }}
              onDiscountClear={() => { setDiscountCode(null); setDiscountAmountCents(0); }}
              error={error} onNext={handleNext} onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <StepReview
              formData={formData} items={items} preview={orderPreview} isLoadingPreview={isLoadingPreview} isSubmitting={isSubmitting}
              cityName={cities.find((c) => c.id === formData.cityId)?.name || ""}
              zoneName={zones.find((z) => z.id === formData.deliveryZoneId)?.zoneName || ""}
              timeSlotLabel={getTimeSlotLabel()}
              paymentMethodLabel={PAYMENT_METHOD_LABELS[formData.paymentMethod] || formData.paymentMethod}
              discountCode={discountCode} error={error}
              onGoToStep={goToStep} onSubmit={handleSubmit} onBack={handleBack}
            />
          )}
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky lg:top-24">
            <OrderSummary
              items={displayItems} subtotal={orderPreview?.subtotalCents ?? subtotal}
              shippingCost={shippingCost} transferDiscount={transferDiscount}
              isLoadingPreview={isLoadingPreview} isPickup={isPickup} preview={orderPreview}
              forceExpanded={currentStep === 4}
            />
          </div>
        </div>
      </div>

      {/* Add-ons Modal */}
      {addOnsModalProductId && (
        <AddOnsModal isOpen={!!addOnsModalProductId} onClose={() => setAddOnsModalProductId(null)}
          productName={items.find((i) => i.product.id === addOnsModalProductId)?.product.name || ""}
          addOnCategories={addOnCategories} addOns={availableAddOns}
          currentAddOns={items.find((i) => i.product.id === addOnsModalProductId)?.addOns}
          onSave={(newAddOns) => updateItemAddOns(addOnsModalProductId, newAddOns)}
        />
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => { setAuthModalOpen(false); if (sessionExpired && useAuthStore.getState().tokens?.accessToken) setSessionExpired(false); }} initialMode={authModalMode} />

      {/* Session Expired Modal */}
      {sessionExpired && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-background rounded-xl shadow-xl p-6">
              <div className="text-center mb-5">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-normal">Tu sesión ha expirado</h3>
                <p className="text-sm text-foreground-secondary mt-1">¿Cómo deseas continuar con tu pedido?</p>
              </div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => { setSessionExpired(false); logout(); setAuthModalMode("login"); setAuthModalOpen(true); }}>Iniciar sesión</Button>
                <Button variant="outline" className="w-full" onClick={() => { setSessionExpired(false); logout(); setIsGuestCheckout(true); }}>Continuar como invitado</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
