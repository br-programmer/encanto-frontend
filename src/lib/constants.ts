// Centralized business contact info and social links
// Update here and it reflects everywhere in the app

const LAT = -0.9464981990443535;
const LNG = -80.73479297503488;
const PLACE_ID = "ChIJDfm1C2a_Ag0RXiVVNTruVXE";
const SHORT_MAP_URL = "https://maps.app.goo.gl/nwEFRDSK7xDvEgwF6";

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
    coordinates: { lat: LAT, lng: LNG },
    placeId: PLACE_ID,
  },
  maps: {
    /** Short share URL pointing at the location pin. */
    placeUrl: SHORT_MAP_URL,
    /** Embeddable iframe URL (Google Maps embed) for the place. */
    embedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.273933566872!2d-80.73479297503488!3d-0.9464981990443535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902be1006b41f90d%3A0x7175ee3a3556255e!2sFlorister%C3%ADa%20Encanto!5e0!3m2!1ses!2sec!4v1769298087116!5m2!1ses!2sec",
    /** Directions URL (opens turn-by-turn in Google Maps). */
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}&destination_place_id=${PLACE_ID}`,
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
