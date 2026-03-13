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
} from "@/lib/api";

interface CheckoutData {
  cities: City[];
  branches: Branch[];
  zones: DeliveryZone[];
  timeSlots: DeliveryTimeSlot[];
  specialDates: SpecialDate[];
  bankAccounts: BankAccount[];
  occasions: Occasion[];
  orderSettings: OrderSettings | null;
  isLoading: boolean;
  error: string | null;
  selectedCityId: string | null;
  selectedBranchId: string | null;
  setSelectedCityId: (cityId: string) => void;
  setSelectedBranchId: (branchId: string) => void;
  getSpecialDateForDate: (date: string) => SpecialDate | null;
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

  const getSpecialDateForDate = useCallback(
    (date: string): SpecialDate | null => {
      return specialDates.find((sd) => sd.date === date) || null;
    },
    [specialDates]
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
    isLoading,
    error,
    selectedCityId,
    selectedBranchId,
    setSelectedCityId,
    setSelectedBranchId,
    getSpecialDateForDate,
    getZoneById,
  };
}
