import { MapPin, Phone, Clock, MessageCircle, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactForm } from "@/components/contact-form";
import { Breadcrumb } from "@/components/breadcrumb";
import { BUSINESS } from "@/lib/constants";

export const metadata = {
  title: "Contacto | Encanto Floristería",
  description: "Contáctanos para pedidos personalizados, consultas o cualquier pregunta. Estamos aquí para ayudarte.",
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Contacto" }]} />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif mb-4">Contáctanos</h1>
          <p className="text-foreground-secondary text-lg">
            ¿Tienes alguna pregunta o quieres hacer un pedido especial?
            Estamos aquí para ayudarte.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Location */}
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Ubicación</h3>
                <a
                  href={BUSINESS.maps.placeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-secondary text-sm hover:text-primary transition-colors"
                >
                  {BUSINESS.address.street}<br />
                  {BUSINESS.address.city}, {BUSINESS.address.country}
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Teléfono</h3>
                <a
                  href={`tel:${BUSINESS.phone.raw}`}
                  className="text-foreground-secondary text-sm hover:text-primary transition-colors"
                >
                  {BUSINESS.phone.display}
                </a>
              </div>
            </div>

            {/* Instagram */}
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
                <Instagram className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Instagram</h3>
                <a
                  href={BUSINESS.social.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-secondary text-sm hover:text-primary transition-colors"
                >
                  {BUSINESS.social.instagram.handle}
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Horario</h3>
                <p className="text-foreground-secondary text-sm">
                  Lunes - Sábado: 9:00 - 19:00<br />
                  Domingos: Cerrado
                </p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="p-6 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="h-6 w-6 text-green-600" />
                <h3 className="font-medium text-green-800">WhatsApp</h3>
              </div>
              <p className="text-sm text-green-700 mb-4">
                Para una respuesta más rápida, escríbenos por WhatsApp.
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                <a
                  href={BUSINESS.whatsapp.url("Hola! Me gustaría hacer una consulta")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Escribir por WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-background p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-serif mb-6">Envíanos un mensaje</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="bg-secondary/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif mb-6 text-center">Encuéntranos</h2>
          <div className="aspect-video md:aspect-21/9 bg-secondary rounded-xl overflow-hidden">
            <iframe
              src={BUSINESS.maps.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Floristería Encanto"
              className="w-full h-full"
            />
          </div>
          <div className="flex justify-center mt-4">
            <a
              href={BUSINESS.maps.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Cómo llegar
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
