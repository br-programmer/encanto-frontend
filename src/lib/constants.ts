// Centralized business contact info and social links
// Update here and it reflects everywhere in the app

export const BUSINESS = {
  name: "Encanto Floristería",
  phone: {
    raw: "+593982742191",
    display: "098 274 2191",
  },
  address: {
    street: "Calle 22",
    city: "Manta",
    country: "Ecuador",
    full: "Calle 22, Manta, Ecuador",
  },
  social: {
    instagram: {
      handle: "@encantofloristeria_ecu",
      url: "https://www.instagram.com/encantofloristeria_ecu",
    },
    tiktok: {
      handle: "@soydorilu",
      displayName: "Florist en Ecuador | soydorilu",
      url: "https://www.tiktok.com/@soydorilu",
    },
  },
  whatsapp: {
    number: "593982742191",
    defaultMessage: "Hola! Me interesa un arreglo floral",
    url: (message?: string) =>
      `https://wa.me/593982742191?text=${encodeURIComponent(message || "Hola! Me interesa un arreglo floral")}`,
  },
} as const;
