"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Check, Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/auth-store";
import { submitServiceRequestAction } from "@/actions/service-request-actions";
import type { ServiceCatalog } from "@/lib/api";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  eventDate: string;
  isFlexibleDate: boolean;
  estimatedGuests: string;
  message: string;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  serviceId: "",
  eventDate: "",
  isFlexibleDate: false,
  estimatedGuests: "",
  message: "",
};

interface ServiceRequestFormProps {
  services: ServiceCatalog[];
}

export function ServiceRequestForm({ services }: ServiceRequestFormProps) {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const serviceSlug = searchParams.get("service");
  const matchedService = serviceSlug
    ? services.find((s) => s.slug === serviceSlug)
    : null;

  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    serviceId: matchedService?.id || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from user profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (formData.message.length < 10) {
      setError("El mensaje debe tener al menos 10 caracteres.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Send the JWT when the user is logged in so the BE links the request
      // to their userId. Without this, the request is created as guest
      // (userId=null) and never appears in "Mis Solicitudes".
      const accessToken = user
        ? await useAuthStore.getState().getValidAccessToken()
        : undefined;
      const result = await submitServiceRequestAction(
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
          serviceId: formData.serviceId || undefined,
          eventDate: formData.eventDate || undefined,
          isFlexibleDate: formData.isFlexibleDate || undefined,
          estimatedGuests: formData.estimatedGuests ? parseInt(formData.estimatedGuests) : undefined,
          message: formData.message,
        },
        accessToken,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.guestToken) {
        localStorage.setItem("encanto-service-request-token", result.guestToken);
      }

      setIsSubmitted(true);
      setFormData(initialFormData);
    } catch {
      setError("Error al enviar la solicitud. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-medium mb-2">¡Solicitud enviada!</h3>
        <p className="text-foreground-secondary mb-6">
          Hemos recibido tu solicitud. Te contactaremos pronto con una propuesta personalizada.
        </p>
        <Button variant="outline" onClick={() => setIsSubmitted(false)}>
          Enviar otra solicitud
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="text-center mb-8">
      <h1 className="text-3xl font-serif mb-3">Solicitar cotización</h1>
      <p className="text-foreground-secondary">
        Cuéntanos qué necesitas y te enviaremos una propuesta personalizada.
      </p>
    </div>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-normal mb-2">
            Nombre completo <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Tu nombre"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-normal mb-2">
            Correo electrónico <span className="text-destructive">*</span>
          </label>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Phone */}
        <div>
          <label className="block text-sm font-normal mb-2">
            Teléfono
          </label>
          <PhoneInput
            value={formData.phone}
            onChange={(phone) => {
              setFormData((prev) => ({ ...prev, phone }));
              setError(null);
            }}
          />
        </div>

        {/* Service */}
        <div>
          <label htmlFor="serviceId" className="block text-sm font-normal mb-2">
            Servicio de interés
          </label>
          <Select
            value={formData.serviceId}
            onValueChange={(value) => {
              setFormData((prev) => ({ ...prev, serviceId: value }));
              setError(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un servicio" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.icon ? `${service.icon} ` : ""}{service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Event Date */}
        <div>
          <label className="block text-sm font-normal mb-2">
            Fecha del evento
          </label>
          <DatePicker
            value={formData.eventDate ? new Date(formData.eventDate + "T00:00:00") : undefined}
            onChange={(date) => {
              setFormData((prev) => ({
                ...prev,
                eventDate: date ? date.toISOString().split("T")[0] : "",
              }));
              setError(null);
            }}
            placeholder="Selecciona una fecha"
            minDate={new Date()}
          />
          <label className="flex items-center gap-3 mt-2 cursor-pointer">
            <Checkbox
              checked={formData.isFlexibleDate}
              onCheckedChange={(checked) => {
                setFormData((prev) => ({ ...prev, isFlexibleDate: checked === true }));
              }}
            />
            <span className="text-xs text-foreground-secondary">Mi fecha es flexible</span>
          </label>
        </div>

        {/* Estimated Guests */}
        <div>
          <label htmlFor="estimatedGuests" className="block text-sm font-normal mb-2">
            Número de invitados
          </label>
          <Input
            type="number"
            id="estimatedGuests"
            name="estimatedGuests"
            value={formData.estimatedGuests}
            onChange={handleChange}
            placeholder="Ej: 50"
            min="1"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-normal mb-2">
          Cuéntanos sobre tu evento <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Describe lo que necesitas: tipo de evento, estilo de decoración, colores, cantidad de arreglos..."
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Enviar solicitud
          </>
        )}
      </Button>
    </form>
    </>
  );
}
