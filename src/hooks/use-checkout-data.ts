"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCheckoutInitialDataAction,
  getBranchesByCityAction,
  getZonesByBranchAction,
} from "@/actions/checkout-actions";
import type {
  City,
  Branch,
  DeliveryZone,
  DeliveryTimeSlot,
  SpecialDate,
  BankAccount,
  Occasion,
  OrderSettings,
  AddOnCategory,
  AddOn,
} from "@/lib/api";

export interface SpecialDateMatch {
  matching: SpecialDate[];
  blocking: boolean;
  allowedSpecialDateIds: Set<string>;
  warningMessage: string | null;
  maxRequiresAdvanceDays: number;
}

interface CheckoutData {
  cities: City[];
  branches: Branch[];
  zones: DeliveryZone[];
  timeSlots: DeliveryTimeSlot[];
  specialDates: SpecialDate[];
  bankAccounts: BankAccount[];
  occasions: Occasion[];
  orderSettings: OrderSettings | null;
  addOnCategories: AddOnCategory[];
  addOns: AddOn[];
  isLoading: boolean;
  error: string | null;
  selectedCityId: string | null;
  selectedBranchId: string | null;
  setSelectedCityId: (cityId: string) => void;
  setSelectedBranchId: (branchId: string) => void;
  getSpecialDateForDate: (date: string) => SpecialDate | null;
  getSpecialDateMatch: (date: string) => SpecialDateMatch;
  getZoneById: (zoneId: string) => DeliveryZone | undefined;
}

export function useCheckoutData(): CheckoutData {
  const [cities, setCities] = useState<City[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [timeSlots, setTimeSlots] = useState<DeliveryTimeSlot[]>([]);
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [orderSettings, setOrderSettings] = useState<OrderSettings | null>(null);
  const [addOnCategories, setAddOnCategories] = useState<AddOnCategory[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityIdState] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchIdState] = useState<string | null>(null);

  // Fetch initial data on mount via Server Action
  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCheckoutInitialDataAction();

        setCities(data.cities);
        setTimeSlots(data.timeSlots);
        setSpecialDates(data.specialDates);
        setBankAccounts(data.bankAccounts);
        setOccasions(data.occasions);
        setOrderSettings(data.orderSettings);
        setAddOnCategories(data.addOnCategories);
        setAddOns(data.addOns);

        // Auto-select first city if only one
        if (data.cities.length === 1) {
          setSelectedCityIdState(data.cities[0].id);
        }
      } catch (err) {
        console.error("Error fetching checkout data:", err);
        setError("Error al cargar los datos. Por favor, recarga la página.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  // Fetch branches when city changes
  useEffect(() => {
    if (!selectedCityId) {
      setBranches([]);
      setZones([]);
      setSelectedBranchIdState(null);
      return;
    }

    async function fetchBranches() {
      try {
        const branchesData = await getBranchesByCityAction(selectedCityId!);
        setBranches(branchesData);

        // Auto-select first branch if only one
        if (branchesData.length === 1) {
          setSelectedBranchIdState(branchesData[0].id);
        } else {
          setSelectedBranchIdState(null);
          setZones([]);
        }
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    }

    fetchBranches();
  }, [selectedCityId]);

  // Fetch zones when branch changes
  useEffect(() => {
    if (!selectedBranchId) {
      setZones([]);
      return;
    }

    async function fetchZones() {
      try {
        const zonesData = await getZonesByBranchAction(selectedBranchId!);
        setZones(zonesData);
      } catch (err) {
        console.error("Error fetching zones:", err);
      }
    }

    fetchZones();
  }, [selectedBranchId]);

  const setSelectedCityId = useCallback((cityId: string) => {
    setSelectedCityIdState(cityId);
  }, []);

  const setSelectedBranchId = useCallback((branchId: string) => {
    setSelectedBranchIdState(branchId);
  }, []);

  const getMatchingSpecialDates = useCallback(
    (date: string): SpecialDate[] => {
      if (!date) return [];
      return specialDates.filter(
        (sd) => sd.isActive && date >= sd.startDate && date <= sd.endDate
      );
    },
    [specialDates]
  );

  const getSpecialDateForDate = useCallback(
    (date: string): SpecialDate | null => {
      return getMatchingSpecialDates(date)[0] || null;
    },
    [getMatchingSpecialDates]
  );

  const getSpecialDateMatch = useCallback(
    (date: string): SpecialDateMatch => {
      const matching = getMatchingSpecialDates(date);
      const blocking = matching.some((sd) => sd.blockRegularProducts);
      const allowedSpecialDateIds = new Set(matching.map((sd) => sd.id));
      const firstWithWarning = matching.find((sd) => sd.warningMessage);
      const maxRequiresAdvanceDays = matching.reduce(
        (acc, sd) => Math.max(acc, sd.requiresAdvanceDays ?? 0),
        0
      );
      return {
        matching,
        blocking,
        allowedSpecialDateIds,
        warningMessage: firstWithWarning?.warningMessage ?? null,
        maxRequiresAdvanceDays,
      };
    },
    [getMatchingSpecialDates]
  );

  const getZoneById = useCallback(
    (zoneId: string): DeliveryZone | undefined => {
      return zones.find((z) => z.id === zoneId);
    },
    [zones]
  );

  return {
    cities,
    branches,
    zones,
    timeSlots,
    specialDates,
    bankAccounts,
    occasions,
    orderSettings,
    addOnCategories,
    addOns,
    isLoading,
    error,
    selectedCityId,
    selectedBranchId,
    setSelectedCityId,
    setSelectedBranchId,
    getSpecialDateForDate,
    getSpecialDateMatch,
    getZoneById,
  };
}
