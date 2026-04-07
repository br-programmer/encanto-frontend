import Link from "next/link";
import { Truck, Clock, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import { BUSINESS } from "@/lib/constants";

export const metadata = {
  title: "Política de Envíos | Encanto Floristería",
  description: "Información sobre entregas, zonas de cobertura, horarios y costos de envío de Encanto Floristería en Manta.",
};

export default function EnviosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Política de Envíos" }]} />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif mb-4">Política de Envíos</h1>
          <p className="text-foreground-secondary text-lg">
            Información completa sobre nuestro servicio de entrega en Manta y zonas aledañas.
          </p>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background p-6 rounded-xl border border-border text-center">
            <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Entrega el Mismo Día</h3>
            <p className="text-foreground-secondary text-sm">
              Pedidos antes de las 2:00 PM se entregan el mismo día
            </p>
          </div>

          <div className="bg-background p-6 rounded-xl border border-border text-center">
            <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Horario de Entregas</h3>
            <p className="text-foreground-secondary text-sm">
              Lunes a Sábado de 9:00 AM a 7:00 PM
            </p>
          </div>

          <div className="bg-background p-6 rounded-xl border border-border text-center">
            <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Cobertura</h3>
            <p className="text-foreground-secondary text-sm">
              Manta y zonas aledañas
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="prose prose-neutral max-w-none">

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">1. Zonas de Cobertura</h2>
            <p className="text-foreground-secondary mb-4">
              Actualmente realizamos entregas en:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li><strong>Manta:</strong> Toda la ciudad incluyendo Tarqui, Los Esteros, El Murciélago, Barbasquillo, Umiña, entre otros.</li>
              <li><strong>Zonas aledañas:</strong> Bajo consulta previa. Contáctenos para verificar disponibilidad.</li>
            </ul>
            <p className="text-foreground-secondary mb-4">
              Para entregas fuera de nuestra zona de cobertura regular, comuníquese con nosotros para
              evaluar la factibilidad y costos adicionales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">2. Horarios de Entrega</h2>

            <h3 className="text-lg font-medium mb-2">Horario Regular</h3>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li><strong>Lunes a Sábado:</strong> 9:00 AM - 7:00 PM</li>
              <li><strong>Domingos:</strong> No realizamos entregas</li>
            </ul>

            <h3 className="text-lg font-medium mb-2">Corte para Entrega el Mismo Día</h3>
            <p className="text-foreground-secondary mb-4">
              Para recibir su pedido el mismo día, debe realizar y confirmar su compra antes de las
              <strong> 2:00 PM</strong>. Los pedidos recibidos después de esta hora se programarán
              para el siguiente día hábil.
            </p>

            <h3 className="text-lg font-medium mb-2">Fechas Especiales</h3>
            <p className="text-foreground-secondary mb-4">
              Durante fechas de alta demanda como San Valentín, Día de la Madre y otras ocasiones especiales,
              recomendamos realizar su pedido con al menos 48 horas de anticipación para garantizar la entrega
              en la fecha deseada.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">3. Costos de Envío</h2>
            <p className="text-foreground-secondary mb-4">
              El costo de envío varía según la zona de entrega:
            </p>
            <div className="bg-secondary/30 rounded-lg p-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Zona</th>
                    <th className="text-right py-2 font-medium">Costo</th>
                  </tr>
                </thead>
                <tbody className="text-foreground-secondary">
                  <tr className="border-b border-border/50">
                    <td className="py-2">Centro de Manta</td>
                    <td className="text-right py-2">$3.00</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">Resto de Manta</td>
                    <td className="text-right py-2">$4.00 - $5.00</td>
                  </tr>
                  <tr>
                    <td className="py-2">Zonas aledañas</td>
                    <td className="text-right py-2">Consultar</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-foreground-secondary text-sm mb-4">
              * Los costos pueden variar durante fechas especiales de alta demanda.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">4. Proceso de Entrega</h2>

            <h3 className="text-lg font-medium mb-2">Confirmación</h3>
            <p className="text-foreground-secondary mb-4">
              Una vez confirmado su pedido, recibirá una notificación con los detalles de la entrega.
              Nos comunicaremos con el destinatario (si es diferente al comprador) para coordinar la entrega.
            </p>

            <h3 className="text-lg font-medium mb-2">Durante la Entrega</h3>
            <p className="text-foreground-secondary mb-4">
              Nuestro repartidor se comunicará con el destinatario al llegar. Es importante que alguien
              esté disponible para recibir el pedido en la dirección indicada.
            </p>

            <h3 className="text-lg font-medium mb-2">Intentos de Entrega</h3>
            <p className="text-foreground-secondary mb-4">
              Si no hay nadie disponible para recibir el pedido, intentaremos contactar al destinatario
              o al comprador. Si no logramos realizar la entrega después de dos intentos, el pedido
              quedará disponible para retiro en nuestra tienda.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">5. Entregas Sorpresa</h2>
            <p className="text-foreground-secondary mb-4">
              Si su pedido es una sorpresa, indíquelo en los comentarios del pedido. Tomaremos las
              precauciones necesarias para no revelar el contenido al destinatario antes de la entrega.
              Sin embargo, necesitamos poder contactar al destinatario para coordinar la entrega.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">6. Entregas Programadas</h2>
            <p className="text-foreground-secondary mb-4">
              Puede programar su entrega para una fecha y hora específica. Ofrecemos las siguientes
              opciones de horario:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>Mañana: 9:00 AM - 12:00 PM</li>
              <li>Mediodía: 12:00 PM - 3:00 PM</li>
              <li>Tarde: 3:00 PM - 7:00 PM</li>
            </ul>
            <p className="text-foreground-secondary mb-4">
              Para horarios específicos (por ejemplo, exactamente a las 10:00 AM), contáctenos para
              verificar disponibilidad. Puede aplicar un costo adicional.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">7. Problemas con la Entrega</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-normal mb-1">Importante</p>
                  <p className="text-amber-700 text-sm">
                    Si hay algún problema con su entrega o el producto llega en mal estado,
                    contáctenos inmediatamente con fotografías. Las reclamaciones deben realizarse
                    dentro de las primeras 2 horas después de la entrega.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-foreground-secondary mb-4">
              Para reportar cualquier inconveniente, comuníquese con nosotros por:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>WhatsApp: {BUSINESS.phone.display}</li>
              <li>Instagram: {BUSINESS.social.instagram.handle}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">8. Retiro en Tienda</h2>
            <p className="text-foreground-secondary mb-4">
              Si prefiere retirar su pedido personalmente, puede hacerlo sin costo de envío en nuestra tienda:
            </p>
            <div className="bg-secondary/30 rounded-lg p-4 mb-4">
              <p className="font-normal">Encanto Floristería</p>
              <p className="text-foreground-secondary">{BUSINESS.address.full}</p>
              <p className="text-foreground-secondary text-sm mt-2">
                Horario: Lunes a Sábado de 9:00 AM a 7:00 PM
              </p>
            </div>
            <p className="text-foreground-secondary mb-4">
              Los pedidos para retiro estarán listos en el horario acordado al momento de la compra.
            </p>
          </section>

        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-secondary/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-serif mb-4">¿Tienes dudas sobre tu envío?</h2>
          <p className="text-foreground-secondary mb-6 max-w-xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos y resolveremos todas tus preguntas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <a
                href={BUSINESS.whatsapp.url("Hola! Tengo una pregunta sobre envíos")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Escribir por WhatsApp
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/preguntas-frecuentes">Ver Preguntas Frecuentes</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
