"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DeliveryZone } from "@/lib/api";
import { findZoneByPointAction } from "@/actions/checkout-actions";
import { formatPrice } from "@/lib/utils";

// Dynamic import to avoid SSR issues with Leaflet
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number, zone: DeliveryZone | null) => void;
  zones?: DeliveryZone[];
  className?: string;
}

// City centers for quick navigation
const CITY_CENTERS: Record<string, [number, number]> = {
  Manta: [-0.95, -80.73],
};

export function MapPicker({ latitude, longitude, onLocationChange, zones = [], className }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [zoneResult, setZoneResult] = useState<DeliveryZone | null | "not_found">(null);
  const [isLocating, setIsLocating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const findZone = useCallback(async (lat: number, lng: number) => {
    setIsSearching(true);
    try {
      const zone = await findZoneByPointAction(lat, lng);
      setZoneResult(zone ?? "not_found");
      onLocationChange(lat, lng, zone);
    } catch {
      setZoneResult("not_found");
      onLocationChange(lat, lng, null);
    } finally {
      setIsSearching(false);
    }
  }, [onLocationChange]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }

    // Debounce the zone lookup
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      findZone(lat, lng);
    }, 400);
  }, [findZone]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 20,
      subdomains: "abcd",
    }).addTo(map);

    const marker = L.marker([latitude, longitude], {
      icon: defaultIcon,
      draggable: true,
    }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      handleMapClick(pos.lat, pos.lng);
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      handleMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Initial zone lookup
    findZone(latitude, longitude);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw delivery zone polygons
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous zones
    if (zonesLayerRef.current) {
      zonesLayerRef.current.clearLayers();
    } else {
      zonesLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    zones.forEach((zone) => {
      if (!zone.polygon || !zonesLayerRef.current) return;

      const geoLayer = L.geoJSON(zone.polygon as GeoJSON.Polygon, {
        style: {
          color: "#aa9083",
          weight: 2,
          opacity: 0.7,
          fillColor: "#f2d0c5",
          fillOpacity: 0.2,
        },
      });

      geoLayer.bindTooltip(
        `${zone.zoneName} — ${formatPrice(zone.deliveryFeeCents)}`,
        { sticky: true, className: "zone-tooltip" }
      );

      geoLayer.addTo(zonesLayerRef.current);
    });
  }, [zones]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        findZone(lat, lng);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">
          Ubicación de entrega <span className="text-destructive">*</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLocateMe}
          disabled={isLocating}
        >
          {isLocating ? (
            <Loader2 className="h-3.5 w-3.5 sm:mr-1.5 animate-spin" />
          ) : (
            <Navigation className="h-3.5 w-3.5 sm:mr-1.5" />
          )}
          <span className="hidden sm:inline">Mi ubicación</span>
        </Button>
      </div>

      <div
        ref={mapContainerRef}
        className="relative z-0 w-full h-[300px] rounded-lg border border-border overflow-hidden [&_.leaflet-tile-pane]:hue-rotate-[330deg] [&_.leaflet-tile-pane]:saturate-[0.3] [&_.leaflet-tile-pane]:brightness-[1.02]"
      />

      <p className="text-xs text-foreground-secondary">
        Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación de entrega.
      </p>

      {/* Zone result */}
      {isSearching ? (
        <div className="flex items-center gap-2 text-sm text-foreground-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Buscando zona de entrega...
        </div>
      ) : zoneResult === "not_found" ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Esta ubicación no está dentro de ninguna zona de entrega disponible. Selecciona otra ubicación.
            </p>
          </div>
        </div>
      ) : zoneResult ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-green-800">{zoneResult.zoneName}</span>
            </div>
            <span className="text-sm font-semibold text-green-800">
              {formatPrice(zoneResult.deliveryFeeCents)} envío
            </span>
          </div>
          {zoneResult.estimatedMinutes && (
            <p className="text-xs text-green-700 mt-1 ml-6">
              Tiempo estimado: ~{zoneResult.estimatedMinutes} min
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
