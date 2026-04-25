"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, AlertTriangle, User, LogIn, UserPlus, Check, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckoutProgress, getTotalSteps } from "./checkout-progress";
import { OrderSummary } from "./order-summary";
import { CheckoutSuccess } from "./checkout-success";
import { PayPalCheckoutModal } from "./paypal-checkout";
import { AddOnsModal } from "./add-ons-modal";
import { AuthModal } from "@/components/auth-modal";
import { PhoneInput, normalizePhoneValue } from "@/components/ui/phone-input";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useSpecialDatesStore } from "@/stores/special-dates-store";
import { useCheckoutData } from "@/hooks/use-checkout-data";
import { StepGuestInfo } from "./steps/step-guest-info";
import { StepDelivery } from "./steps/step-delivery";
import { StepSchedule } from "./steps/step-schedule";
import { StepBilling, type BillingFormState } from "./steps/step-billing";
import { StepPayment } from "./steps/step-payment";
import { StepReview } from "./steps/step-review";

import { previewOrderAction, createOrderAction } from "@/actions/order-actions";
import {
  getInvoiceProfilesAction,
  createInvoiceProfileAction,
} from "@/actions/invoice-profile-actions";
import {
  getDeliveryAddressesAction,
  createDeliveryAddressAction,
} from "@/actions/address-actions";
import type {
  Order,
  OrderPreview,
  BankAccount,
  DeliveryZone,
  FulfillmentType,
  UserInvoiceProfile,
  DeliveryAddressApi,
} from "@/lib/api";
import { validateDocumentByType } from "@/lib/ecuadorian-document";
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

// Step mapping: guest has extra step 1 (guest info)
type StepName = "guest_info" | "delivery" | "schedule" | "billing" | "payment" | "review";

function getStepNumber(name: StepName, isGuest: boolean): number {
  if (isGuest) {
    const map: Record<StepName, number> = { guest_info: 1, delivery: 2, schedule: 3, billing: 4, payment: 5, review: 6 };
    return map[name];
  }
  const map: Record<StepName, number> = { guest_info: 0, delivery: 1, schedule: 2, billing: 3, payment: 4, review: 5 };
  return map[name];
}

function getStepName(step: number, isGuest: boolean): StepName {
  if (isGuest) {
    const map: Record<number, StepName> = { 1: "guest_info", 2: "delivery", 3: "schedule", 4: "billing", 5: "payment", 6: "review" };
    return map[step] || "guest_info";
  }
  const map: Record<number, StepName> = { 1: "delivery", 2: "schedule", 3: "billing", 4: "payment", 5: "review" };
  return map[step] || "delivery";
}

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
  const [invoiceProfiles, setInvoiceProfiles] = useState<UserInvoiceProfile[]>([]);
  const [isLoadingInvoiceProfiles, setIsLoadingInvoiceProfiles] = useState(false);
  const [billing, setBilling] = useState<BillingFormState>({
    invoiceProfileId: "",
    documentType: "cedula",
    documentNumber: "",
    fullName: "",
    email: "",
    address: "",
    phone: "",
    saveProfile: false,
  });

  const { items, totalPrice, clearCart, updateItemCardMessage, updateItemAddOns } = useCartStore();
  const { user, tokens, logout } = useAuthStore();
  const [addresses, setAddresses] = useState<DeliveryAddressApi[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const fetchSpecialDatesStore = useSpecialDatesStore((s) => s.fetch);
  const getSpecialDateById = useSpecialDatesStore((s) => s.getById);

  useEffect(() => {
    fetchSpecialDatesStore();
  }, [fetchSpecialDatesStore]);

  // Load invoice profiles when logged in; pre-fill billing with default profile
  useEffect(() => {
    if (!tokens?.accessToken) {
      setInvoiceProfiles([]);
      setIsLoadingInvoiceProfiles(false);
      return;
    }
    let cancelled = false;
    setIsLoadingInvoiceProfiles(true);
    (async () => {
      try {
        const validToken = await useAuthStore.getState().getValidAccessToken();
        if (cancelled || !validToken) return;
        const res = await getInvoiceProfilesAction(validToken, { limit: 50 });
        if (cancelled) return;
        setInvoiceProfiles(res.result);
        const def = res.result.find((p) => p.isDefault) || res.result[0];
        if (def) {
          setBilling((prev) => prev.invoiceProfileId ? prev : ({
            invoiceProfileId: def.id,
            documentType: def.documentType,
            documentNumber: def.documentNumber,
            fullName: def.fullName,
            email: def.email,
            address: def.address || "",
            phone: def.phone || "",
            saveProfile: false,
          }));
        }
      } catch { /* ignore */ }
      finally {
        if (!cancelled) setIsLoadingInvoiceProfiles(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tokens?.accessToken]);

  const {
    cities, branches, zones, timeSlots, bankAccounts, occasions, orderSettings,
    addOnCategories, addOns: availableAddOns,
    isLoading: isLoadingCheckoutData, error: checkoutDataError,
    selectedCityId, selectedBranchId, setSelectedCityId, setSelectedBranchId,
    getSpecialDateMatch, getZoneById,
  } = useCheckoutData();

  // Compute blocked cart items for the selected delivery date
  const specialDateMatch = getSpecialDateMatch(formData.deliveryDate);
  const invalidCartItemIds = new Set<string>(
    !formData.deliveryDate
      ? []
      : items
          .filter((item) => {
            const productSpecialDateId = item.product.specialDateId;
            // Product tied to a campaign: must be active on this delivery date
            if (productSpecialDateId) {
              return !specialDateMatch.allowedSpecialDateIds.has(productSpecialDateId);
            }
            // Regular product: only blocked when an active campaign blocks regulars
            return specialDateMatch.blocking;
          })
          .map((item) => item.product.id)
  );
  const hasBlockingConflict = invalidCartItemIds.size > 0;
  const blockingCampaign = specialDateMatch.blocking
    ? specialDateMatch.matching.find((sd) => sd.blockRegularProducts) ?? null
    : null;
  // First campaign tied to an invalid item (for "Ver productos" link when no blocking campaign)
  const firstInvalidItemCampaign = (() => {
    if (blockingCampaign) return null;
    for (const item of items) {
      if (item.product.specialDateId && invalidCartItemIds.has(item.product.id)) {
        return getSpecialDateById(item.product.specialDateId);
      }
    }
    return null;
  })();

  // Cart-campaign restriction: if all items belong to one campaign (no regulars),
  // lock the date picker to that campaign's range.
  const cartCampaign = (() => {
    if (items.length === 0) return null;
    const ids = Array.from(new Set(items.map((it) => it.product.specialDateId)));
    if (ids.length !== 1) return null;
    const onlyId = ids[0];
    if (!onlyId) return null;
    return getSpecialDateById(onlyId);
  })();
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

  // Persist while on checkout
  useEffect(() => { if (mounted) saveFormData(formData); }, [mounted, formData]);
  useEffect(() => { if (mounted) saveStep(currentStep); }, [mounted, currentStep]);

  // Clear session data when leaving checkout
  useEffect(() => {
    return () => { clearSavedFormData(); };
  }, []);

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
    }
  }, [mounted, user]);

  // Load saved addresses from BE for logged-in users, pre-fill with default
  useEffect(() => {
    if (!mounted || !tokens?.accessToken) {
      setAddresses([]);
      setIsLoadingAddresses(false);
      return;
    }
    let cancelled = false;
    setIsLoadingAddresses(true);
    (async () => {
      try {
        const validToken = await useAuthStore.getState().getValidAccessToken();
        if (cancelled || !validToken) return;
        const res = await getDeliveryAddressesAction(validToken, { limit: 50 });
        if (cancelled) return;
        setAddresses(res.result);
        const def = res.result.find((a) => a.isDefault) || res.result[0];
        if (def) {
          // Only pre-fill when the form is pristine (no in-progress data from
          // sessionStorage restore or manual input). recipientName is the
          // flag: empty = fresh form; filled = user or session already has data.
          setFormData((p) => {
            if (p.recipientName) return p;
            return {
              ...p,
              recipientName: def.recipientName,
              recipientPhone: def.recipientPhone,
              address: def.address,
              deliveryReference: def.reference || "",
              latitude: parseFloat(def.latitude),
              longitude: parseFloat(def.longitude),
              // Pre-seed zoneId if available on the saved address so the map
              // can draw the polygon without an extra lookup round-trip.
              ...(def.zoneId ? { deliveryZoneId: def.zoneId } : {}),
            };
          });
          setSelectedAddressId((prev) => prev ?? def.id);
        }
      } catch { /* ignore */ }
      finally {
        if (!cancelled) setIsLoadingAddresses(false);
      }
    })();
    return () => { cancelled = true; };
  }, [mounted, tokens?.accessToken]);

  // Redirect if cart empty
  useEffect(() => {
    if (mounted && items.length === 0 && !isSubmitted && !pendingPayPal) router.push("/productos");
  }, [mounted, items.length, isSubmitted, pendingPayPal, router]);

  // Auto-select delivery date when cart has items from exactly one special-date campaign
  useEffect(() => {
    if (!mounted) return;
    if (formData.deliveryDate) return;
    if (items.length === 0) return;

    const ids = new Set(items.map((it) => it.product.specialDateId));
    const uniqueIds = Array.from(ids);
    if (uniqueIds.length !== 1) return;
    const onlyId = uniqueIds[0];
    if (!onlyId) return;

    const campaign = getSpecialDateById(onlyId);
    if (!campaign) return;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const minAdvanceDays = Math.max(
      orderSettings?.minAdvanceDays ?? 2,
      campaign.requiresAdvanceDays ?? 0
    );
    const earliestByAdvance = new Date(today);
    earliestByAdvance.setDate(earliestByAdvance.getDate() + minAdvanceDays);

    const campaignStart = new Date(campaign.startDate + "T00:00:00");
    const campaignEnd = new Date(campaign.endDate + "T00:00:00");
    const target = earliestByAdvance > campaignStart ? earliestByAdvance : campaignStart;
    if (target > campaignEnd) return; // no valid day left in campaign

    const iso = target.toISOString().split("T")[0];
    setFormData((p) => ({ ...p, deliveryDate: iso }));
  }, [mounted, items, formData.deliveryDate, getSpecialDateById, orderSettings?.minAdvanceDays]);

  // Special date check (by range)
  useEffect(() => {
    if (!formData.deliveryDate) {
      setSpecialDateWarning(null);
      return;
    }
    const match = getSpecialDateMatch(formData.deliveryDate);
    setSpecialDateWarning(match.warningMessage);
    if (match.maxRequiresAdvanceDays > 0) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const deliveryDate = new Date(formData.deliveryDate + "T00:00:00");
      const diffDays = Math.ceil(
        (deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays < match.maxRequiresAdvanceDays) {
        const name = match.matching[0]?.name ?? "esta fecha especial";
        setError(
          `Para ${name} se requiere un mínimo de ${match.maxRequiresAdvanceDays} días de anticipación`
        );
      }
    }
  }, [formData.deliveryDate, getSpecialDateMatch]);

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
  const isGuest = isGuestCheckout && !user;
  const currentStepName = getStepName(currentStep, isGuest);
  const totalSteps = getTotalSteps(isGuest);
  const reviewStep = getStepNumber("review", isGuest);
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

  const handleSelectAddress = (address: DeliveryAddressApi) => {
    setSelectedAddressId(address.id);
    setFormData((p) => ({
      ...p,
      recipientName: address.recipientName,
      recipientPhone: address.recipientPhone,
      address: address.address,
      deliveryReference: address.reference || "",
      latitude: parseFloat(address.latitude),
      longitude: parseFloat(address.longitude),
    }));
  };

  const handleNewAddress = () => {
    setSelectedAddressId(null);
    setFormData((p) => ({ ...p, recipientName: "", recipientPhone: "", address: "", deliveryReference: "" }));
    setSaveAddress(true);
  };

  const getMinDeliveryDate = (): string => {
    const allQuickDelivery = items.length > 0 && items.every((item) => item.product.isQuickDelivery);
    const campaignAdvance = cartCampaign?.requiresAdvanceDays ?? 0;
    const baseMin = allQuickDelivery ? 1 : (orderSettings?.minAdvanceDays ?? 2);
    const minDays = Math.max(baseMin, campaignAdvance);
    const date = new Date();
    date.setDate(date.getDate() + minDays);
    const iso = date.toISOString().split("T")[0];
    if (cartCampaign && iso < cartCampaign.startDate) return cartCampaign.startDate;
    return iso;
  };

  const getMaxDeliveryDate = (): string | undefined => cartCampaign?.endDate;

  const formatTimeSlot = (startTime: string, endTime: string, label: string | null): string => {
    const fmt = (t: string) => { const [h, m] = t.split(":"); const hour = parseInt(h); return `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${m} ${hour >= 12 ? "PM" : "AM"}`; };
    const timeRange = `${fmt(startTime)} - ${fmt(endTime)}`;
    return label ? `${label} (${timeRange})` : timeRange;
  };

  // Step validation by name
  const validateStepByName = (name: StepName): boolean => {
    setError(null);
    if (name === "guest_info") {
      if (!formData.senderName.trim()) { setError("Ingresa tu nombre"); return false; }
      if (!formData.senderEmail.trim()) { setError("Ingresa tu correo electrónico"); return false; }
      if (!formData.senderPhone.trim()) { setError("Ingresa tu teléfono"); return false; }
    }
    if (name === "delivery") {
      if (!formData.recipientName.trim()) { setError(isPickup ? "Ingresa el nombre de quien retira" : "Ingresa el nombre del destinatario"); return false; }
      if (!isPickup && !formData.recipientPhone.trim()) { setError("Ingresa el teléfono del destinatario"); return false; }
      if (!isPickup && !formData.address.trim()) { setError("Ingresa la dirección de entrega"); return false; }
      if (!isPickup && !formData.cityId) { setError("Selecciona una ciudad"); return false; }
      if (!isPickup && !formData.deliveryZoneId) { setError("Selecciona la zona de entrega"); return false; }
      if (!formData.branchId) { setError("Selecciona una sucursal"); return false; }
    }
    if (name === "schedule") {
      if (!formData.deliveryDate) { setError("Selecciona la fecha de entrega"); return false; }
      if (!formData.deliveryTimeSlotId) { setError("Selecciona el horario de entrega"); return false; }
      if (formData.differentBuyer) {
        if (!formData.senderName.trim()) { setError("Ingresa el nombre del comprador"); return false; }
        if (!formData.senderPhone.trim()) { setError("Ingresa el teléfono del comprador"); return false; }
      }
      const match = getSpecialDateMatch(formData.deliveryDate);
      if (match.maxRequiresAdvanceDays > 0) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const dd = new Date(formData.deliveryDate + "T00:00:00");
        if (Math.ceil((dd.getTime() - today.getTime()) / 86400000) < match.maxRequiresAdvanceDays) {
          const sdName = match.matching[0]?.name ?? "esta fecha especial";
          setError(`Para ${sdName} se requiere ${match.maxRequiresAdvanceDays} días de anticipación`); return false;
        }
      }
      if (hasBlockingConflict) {
        if (blockingCampaign) {
          setError(
            `Para esta fecha solo están disponibles productos de ${blockingCampaign.name}. Retira los productos marcados en tu carrito o cambia la fecha.`
          );
        } else if (firstInvalidItemCampaign) {
          setError(
            `Los productos de ${firstInvalidItemCampaign.name} solo se pueden entregar dentro del rango de la campaña. Cambia la fecha o retira esos productos.`
          );
        } else {
          setError("Hay productos incompatibles con la fecha de entrega seleccionada.");
        }
        return false;
      }
    }
    if (name === "billing") {
      const limit = orderSettings?.finalConsumerLimitCents;
      const total = orderPreview?.totalCents ?? subtotal;
      if (billing.documentType === "final_consumer") {
        if (limit != null && total >= limit) {
          setError(`El total supera ${formatPrice(limit)}. Debes identificar al adquirente con cédula, RUC o pasaporte.`);
          return false;
        }
      } else {
        if (!billing.fullName.trim()) { setError("Ingresa el nombre o razón social"); return false; }
        if (!billing.email.trim()) { setError("Ingresa el correo para la factura"); return false; }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(billing.email.trim())) { setError("Correo de facturación inválido"); return false; }
        const docCheck = validateDocumentByType(
          billing.documentType as "cedula" | "ruc" | "pasaporte" | "identificacion_exterior",
          billing.documentNumber.trim()
        );
        if (!docCheck.valid) { setError(docCheck.error || "Documento inválido"); return false; }
      }
    }
    if (name === "payment") {
      if (!formData.paymentMethod) { setError("Selecciona un método de pago"); return false; }
    }
    return true;
  };

  const validateStep = (step: number): boolean => validateStepByName(getStepName(step, isGuest));

  const goToStep = (step: number) => { setCurrentStep(step); setError(null); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = currentStep + 1;
      // Mark current and all previous steps as completed
      const allCompleted = Array.from({ length: currentStep }, (_, i) => i + 1);
      setCompletedSteps((p) => [...new Set([...p, ...allCompleted])]);
      goToStep(nextStep);
    }
  };

  const handleBack = () => { if (currentStep > 1) goToStep(currentStep - 1); };

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step) || step < currentStep) goToStep(step);
  };

  // Submit
  const handleSubmit = async () => {
    // Validate all steps before submit
    const stepsToValidate: StepName[] = isGuest
      ? ["guest_info", "delivery", "schedule", "billing", "payment"]
      : ["delivery", "schedule", "billing", "payment"];
    for (const name of stepsToValidate) {
      if (!validateStepByName(name)) return;
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
        // Invoice (SRI)
        invoiceDocumentType: billing.documentType,
        ...(billing.documentType === "final_consumer"
          ? {}
          : {
              invoiceDocumentNumber: billing.documentNumber.trim(),
              invoiceFullName: billing.fullName.trim(),
              invoiceEmail: billing.email.trim(),
              ...(billing.address.trim() ? { invoiceAddress: billing.address.trim() } : {}),
              ...(billing.phone.trim() ? { invoicePhone: billing.phone.trim() } : {}),
            }),
        // When using a saved profile, also send the ID so BE snapshots it.
        // Fields above are still required by the BE DTO validator regardless.
        ...(billing.invoiceProfileId &&
        billing.invoiceProfileId !== "new" &&
        billing.invoiceProfileId !== "final_consumer"
          ? { invoiceProfileId: billing.invoiceProfileId }
          : {}),
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

      if (saveAddress && !selectedAddressId && user && validAccessToken) {
        createDeliveryAddressAction(
          {
            nickname: addressLabel,
            recipientName: formData.recipientName,
            recipientPhone: formData.recipientPhone,
            address: formData.address,
            city: selectedCity?.name || "",
            ...(formData.deliveryZoneId ? { zoneId: formData.deliveryZoneId } : {}),
            ...(formData.deliveryReference ? { reference: formData.deliveryReference } : {}),
            latitude: formData.latitude,
            longitude: formData.longitude,
            isDefault: addresses.length === 0,
          },
          validAccessToken
        ).catch(() => { /* non-critical */ });
      }

      setCreatedOrder(order); clearCart(); clearSavedFormData();
      sessionStorage.setItem("encanto-order-created", "true");

      // Save billing profile in background if user opted in
      if (
        billing.saveProfile &&
        validAccessToken &&
        billing.documentType !== "final_consumer" &&
        (billing.invoiceProfileId === "new" || billing.invoiceProfileId === "")
      ) {
        createInvoiceProfileAction(
          {
            documentType: billing.documentType as "cedula" | "ruc" | "pasaporte" | "identificacion_exterior",
            documentNumber: billing.documentNumber.trim(),
            fullName: billing.fullName.trim(),
            email: billing.email.trim(),
            ...(billing.address.trim() ? { address: billing.address.trim() } : {}),
            ...(billing.phone.trim() ? { phone: billing.phone.trim() } : {}),
            isDefault: invoiceProfiles.length === 0,
          },
          validAccessToken
        ).catch(() => { /* non-critical */ });
      }

      if (formData.paymentMethod === "paypal") {
        setPaypalTokens({ accessToken: validAccessToken, guestToken: order.guestToken || guestToken });
        setPendingPayPal(true);
      } else { setIsSubmitted(true); }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const lower = msg.toLowerCase();
      let friendly: string | null = null;
      if (lower.includes("regularproductnotallowed") || lower.includes("regular_product_not_allowed") || lower.includes("regular product")) {
        friendly = "Uno o más productos del carrito no están disponibles para la fecha seleccionada. Solo se permiten productos de la fecha especial activa.";
      } else if (lower.includes("productfromdifferentspecialdate") || lower.includes("different_special_date") || lower.includes("different special date")) {
        friendly = "Uno o más productos pertenecen a otra fecha especial y no están disponibles para la fecha de entrega seleccionada.";
      } else if (lower.includes("specialdateadvance") || lower.includes("special_date_advance") || lower.includes("days of advance")) {
        friendly = "Esta fecha especial requiere más días de anticipación. Elige otra fecha de entrega.";
      } else if (lower.includes("invoicefinalconsumerlimit") || lower.includes("final_consumer")) {
        friendly = "El total del pedido supera el límite para consumidor final. Debes identificar al adquirente con cédula, RUC o pasaporte.";
      } else if (lower.includes("invoiceprofilerequiresauth")) {
        friendly = "Solo usuarios autenticados pueden usar un perfil de facturación guardado.";
      }
      setError(
        friendly ||
          (msg && msg !== "API Error: 400 Bad Request" && !msg.startsWith("API Error:")
            ? msg
            : "Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.")
      );
    } finally { setIsSubmitting(false); }
  };

  const handleNewOrder = () => { setIsSubmitted(false); setCreatedOrder(null); setFormData(initialFormData); clearSavedFormData(); setCurrentStep(1); setCompletedSteps([]); router.push("/productos"); };

  // Loading
  if (!mounted || isLoadingCheckoutData || isLoadingAddresses || isLoadingInvoiceProfiles) {
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
        <div className="flex justify-center mb-4">
          <Image src="/logo.svg" alt="Encanto" width={160} height={50} className="h-14 sm:h-16 w-auto" />
        </div>
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
          <button onClick={() => { setIsGuestCheckout(true); setFormData((p) => ({ ...p, senderName: "", senderEmail: "", senderPhone: "" })); }} className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
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
        <div className="flex justify-center mb-4">
          <Image src="/logo.svg" alt="Encanto" width={160} height={50} className="h-14 sm:h-16 w-auto" />
        </div>
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
        <CheckoutProgress currentStep={currentStep} completedSteps={completedSteps} onStepClick={handleStepClick} isGuest={isGuest} />
      </div>

      {currentStepName === "review" ? (
        /* Review: Full width (no sidebar) */
        <div className="max-w-2xl mx-auto pb-12">
          <StepReview
            formData={formData} items={items} preview={orderPreview} isLoadingPreview={isLoadingPreview} isSubmitting={isSubmitting}
            cityName={cities.find((c) => c.id === formData.cityId)?.name || ""}
            zoneName={zones.find((z) => z.id === formData.deliveryZoneId)?.zoneName || ""}
            branchName={branches.find((b) => b.id === formData.branchId)?.name || ""}
            timeSlotLabel={getTimeSlotLabel()}
            paymentMethodLabel={PAYMENT_METHOD_LABELS[formData.paymentMethod] || formData.paymentMethod}
            discountCode={discountCode} error={error}
            onGoToStep={goToStep} onSubmit={handleSubmit} onBack={handleBack}
          />
        </div>
      ) : (
        /* Form steps + sidebar */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
          <div className="lg:col-span-7 xl:col-span-8">
            {currentStepName === "guest_info" && (
              <StepGuestInfo
                formData={formData} onFormChange={handleFormChange} onPhoneChange={handlePhoneChange}
                onSwitchToLogin={() => { setIsGuestCheckout(false); setCurrentStep(1); }}
                error={error} onNext={handleNext}
              />
            )}
            {currentStepName === "delivery" && (
              <StepDelivery
                formData={formData} onFormChange={handleFormChange} onSelectChange={handleSelectChange}
                onMapLocationChange={handleMapLocationChange} onPhoneChange={handlePhoneChange}
                cities={cities} branches={branches} zones={zones} addresses={addresses}
                selectedAddressId={selectedAddressId} onSelectAddress={handleSelectAddress} onNewAddress={handleNewAddress}
                saveAddress={saveAddress} onSaveAddressChange={setSaveAddress} addressLabel={addressLabel} onAddressLabelChange={setAddressLabel}
                user={user} isPickup={isPickup} error={error} onNext={handleNext}
                onBack={isGuest ? handleBack : undefined}
              />
            )}
            {currentStepName === "schedule" && (
              <StepSchedule
                formData={formData} onFormChange={handleFormChange} onSelectChange={handleSelectChange} onPhoneChange={handlePhoneChange}
                timeSlots={timeSlots} occasions={occasions} specialDateWarning={specialDateWarning}
                blockingCampaign={
                  blockingCampaign
                    ? { name: blockingCampaign.name, slug: blockingCampaign.slug, kind: "blocking" }
                    : firstInvalidItemCampaign
                      ? { name: firstInvalidItemCampaign.name, slug: firstInvalidItemCampaign.slug, kind: "out-of-range" }
                      : null
                }
                invalidCartItemIds={invalidCartItemIds}
                minDeliveryDate={getMinDeliveryDate()} maxDeliveryDate={getMaxDeliveryDate()} formatTimeSlot={formatTimeSlot} isPickup={isPickup} user={user}
                items={items} onUpdateCardMessage={updateItemCardMessage} onOpenAddOns={setAddOnsModalProductId} availableAddOns={availableAddOns}
                error={error} onNext={handleNext} onBack={handleBack}
              />
            )}
            {currentStepName === "billing" && (
              <StepBilling
                billing={billing}
                onChange={(u) => setBilling((prev) => ({ ...prev, ...u }))}
                profiles={invoiceProfiles}
                isLoggedIn={!!user}
                totalCents={orderPreview?.totalCents ?? subtotal}
                finalConsumerLimitCents={orderSettings?.finalConsumerLimitCents}
                error={error}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStepName === "payment" && (
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
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-24">
              <OrderSummary
                items={displayItems} subtotal={orderPreview?.subtotalCents ?? subtotal}
                shippingCost={shippingCost} transferDiscount={transferDiscount}
                isLoadingPreview={isLoadingPreview} isPickup={isPickup} preview={orderPreview}
                forceExpanded={false}
              />
            </div>
          </div>
        </div>
      )}

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
