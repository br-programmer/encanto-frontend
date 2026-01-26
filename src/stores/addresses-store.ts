import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DeliveryAddress {
  id: string;
  label: string; // "Casa", "Trabajo", "Otro"
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  zone: string;
  notes?: string;
  isDefault: boolean;
  createdAt: string;
}

interface AddressesState {
  addresses: DeliveryAddress[];

  // Actions
  addAddress: (address: Omit<DeliveryAddress, "id" | "createdAt">) => DeliveryAddress;
  updateAddress: (id: string, data: Partial<DeliveryAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => DeliveryAddress | undefined;
}

export const useAddressesStore = create<AddressesState>()(
  persist(
    (set, get) => ({
      addresses: [],

      addAddress: (addressData) => {
        const newAddress: DeliveryAddress = {
          ...addressData,
          id: `addr_${Date.now()}`,
          createdAt: new Date().toISOString(),
          // If this is the first address or marked as default, set it as default
          isDefault: addressData.isDefault || get().addresses.length === 0,
        };

        set((state) => {
          // If new address is default, unset other defaults
          const updatedAddresses = newAddress.isDefault
            ? state.addresses.map((addr) => ({ ...addr, isDefault: false }))
            : state.addresses;

          return {
            addresses: [...updatedAddresses, newAddress],
          };
        });

        return newAddress;
      },

      updateAddress: (id, data) => {
        set((state) => {
          // If setting as default, unset other defaults
          let addresses = state.addresses;
          if (data.isDefault) {
            addresses = addresses.map((addr) => ({
              ...addr,
              isDefault: addr.id === id,
            }));
          } else {
            addresses = addresses.map((addr) =>
              addr.id === id ? { ...addr, ...data } : addr
            );
          }

          return { addresses };
        });
      },

      deleteAddress: (id) => {
        set((state) => {
          const filtered = state.addresses.filter((addr) => addr.id !== id);

          // If we deleted the default and there are still addresses, make the first one default
          const hasDefault = filtered.some((addr) => addr.isDefault);
          if (!hasDefault && filtered.length > 0) {
            filtered[0].isDefault = true;
          }

          return { addresses: filtered };
        });
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((addr) => ({
            ...addr,
            isDefault: addr.id === id,
          })),
        }));
      },

      getDefaultAddress: () => {
        return get().addresses.find((addr) => addr.isDefault);
      },
    }),
    {
      name: "encanto-addresses",
    }
  )
);
