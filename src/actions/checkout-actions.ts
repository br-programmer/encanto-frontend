"use server";

import { api } from "@/lib/api";
import type {
  City,
  Branch,
  DeliveryZone,
  DeliveryTimeSlot,
  SpecialDate,
  BankAccount,
  Occasion,
  OrderSettings,
  ProductAddOnsGroup,
  AddOnCategory,
  AddOn,
} from "@/lib/api";

export interface CheckoutInitialData {
  cities: City[];
  timeSlots: DeliveryTimeSlot[];
  specialDates: SpecialDate[];
  bankAccounts: BankAccount[];
  occasions: Occasion[];
  orderSettings: OrderSettings | null;
  addOnCategories: AddOnCategory[];
  addOns: AddOn[];
}

export async function getCheckoutInitialDataAction(): Promise<CheckoutInitialData> {
  const [cities, timeSlots, specialDates, bankAccounts, occasions, orderSettings, addOnCategories, addOns] =
    await Promise.all([
      api.cities.active(),
      api.timeSlots.active(),
      api.specialDates.active().catch(() => []),
      api.bankAccounts.active(),
      api.occasions.active(),
      api.orderSettings.get(),
      api.addOnCategories.active(),
      api.addOns.list(),
    ]);

  return {
    cities,
    timeSlots,
    specialDates,
    bankAccounts,
    occasions,
    orderSettings,
    addOnCategories,
    addOns,
  };
}

export async function getProductAddOnsAction(productId: string): Promise<ProductAddOnsGroup[]> {
  return api.products.addOns(productId);
}

export async function getBranchesByCityAction(cityId: string): Promise<Branch[]> {
  return api.branches.byCity(cityId);
}

export async function getZonesByBranchAction(branchId: string): Promise<DeliveryZone[]> {
  return api.deliveryZones.byBranch(branchId);
}

export async function findZoneByPointAction(lat: number, lng: number): Promise<DeliveryZone | null> {
  return api.deliveryZones.contains(lat, lng);
}

