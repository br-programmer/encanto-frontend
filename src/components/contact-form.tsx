"use client";

import { useState } from "react";
import { Send, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitContactAction } from "@/actions/contact-actions";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const result = await submitContactAction({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsSubmitted(true);
      setFormData(initialFormData);
    } catch {
      setError("Error al enviar el mensaje. Intenta de nuevo.");
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
        <h3 className="text-xl font-medium mb-2">¡Mensaje enviado!</h3>
        <p className="text-foreground-secondary mb-6">
          Gracias por contactarnos. Te responderemos pronto.
        </p>
        <Button variant="outline" onClick={() => setIsSubmitted(false)}>
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
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
          <label htmlFor="phone" className="block text-sm font-normal mb-2">
            Teléfono
          </label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+593 99 999 9999"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-normal mb-2">
            Asunto <span className="text-destructive">*</span>
          </label>
          <Select value={formData.subject} onValueChange={(value) => { setFormData((prev) => ({ ...prev, subject: value })); setError(null); }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un asunto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="place_order">Hacer un pedido</SelectItem>
              <SelectItem value="general_inquiry">Consulta general</SelectItem>
              <SelectItem value="custom_arrangement">Arreglo personalizado</SelectItem>
              <SelectItem value="special_event">Evento especial</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-normal mb-2">
          Mensaje <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Cuéntanos en qué podemos ayudarte..."
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit button */}
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Enviar mensaje
          </>
        )}
      </Button>
    </form>
  );
}
