import Link from "next/link";
import { Truck, Clock, MapPin, AlertCircle, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import { BUSINESS } from "@/lib/constants";

export const metadata = {
  title: "Política de Envíos | Encanto Floristería",
  description: "Información sobre entregas a domicilio, horarios, retiro en tienda y política de entregas de Encanto Floristería.",
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
            Información completa sobre nuestro servicio de entrega a domicilio y retiro en tienda.
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
            <h3 className="font-medium mb-2">Entrega a domicilio</h3>
            <p className="text-foreground-secondary text-sm">
              Costo calculado según la dirección de entrega
            </p>
          </div>

          <div className="bg-background p-6 rounded-xl border border-border text-center">
            <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Horario de entregas</h3>
            <p className="text-foreground-secondary text-sm">
              8:30 a 12:00 y 13:00 a 19:00
            </p>
          </div>

          <div className="bg-background p-6 rounded-xl border border-border text-center">
            <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Retiro en tienda</h3>
            <p className="text-foreground-secondary text-sm">
              Sin costo adicional, con 24h de anticipación
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="prose prose-neutral max-w-none">

          {/* Entregas a domicilio */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Entregas a domicilio</h2>
            <p className="text-foreground-secondary mb-4">
              La tarifa de envío a domicilio no se refleja en el precio del arreglo, este se calculará en
              función de la dirección de entrega, tomando como base la dirección de nuestra tienda matriz.
            </p>

            <h3 className="text-lg font-medium mb-2">Puntos de referencia por ciudad</h3>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-3 mb-4">
              <li>
                <strong>Manta:</strong> Tienda matriz ubicada en calle 22 y avenida Flavio Reyes (atrás del SRI).
              </li>
              <li>
                <strong>Portoviejo:</strong> Envíos realizados por medio del servicio Manporcar con un valor de $2,50
                (puede cambiar en base a las políticas de Manporcar).
              </li>
              <li>
                <strong>Quevedo:</strong> Tienda matriz ubicada en el centro de la ciudad, calle Décima Tercera entre
                Av. June Guzmán y 12 de Octubre.
              </li>
              <li>
                <strong>Valencia:</strong> Tienda matriz ubicada en Av. 13 de Diciembre y Arcos Pérez (cerca del Banco Pichincha).
              </li>
            </ul>
          </section>

          {/* Horarios de entrega */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Horarios de entrega</h2>
            <p className="text-foreground-secondary mb-4">
              Recordando que se podría tener múltiples variables tales como el tráfico, disponibilidad de
              parqueo, daños mecánicos de nuestras unidades, accidentes, etc., no podemos garantizar la hora
              exacta de entrega de nuestras flores. ENCANTO FLORISTERÍA maneja el siguiente rango de entregas:
            </p>
            <div className="bg-secondary/30 rounded-lg p-4 mb-4">
              <p className="font-medium mb-1">Rango de entregas de arreglos florales</p>
              <p className="text-foreground-secondary">De 8:30 a 12:00 y de 13:00 a 19:00</p>
              <p className="text-foreground-secondary text-sm mt-2">
                Entregas fuera de este rango se podrán realizar previa coordinación.
              </p>
            </div>
            <p className="text-foreground-secondary text-sm">
              Los horarios de entrega estipulados se manejan bajo zona horaria UTC-5 América/Guayaquil, Ecuador.
            </p>
          </section>

          {/* Fechas importantes */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Entregas en fechas importantes</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 text-sm">
                  Para fechas importantes como San Valentín, Día de la Mujer, Día de la Madre y Día del Padre,
                  las entregas serán realizadas en el transcurso del día desde las <strong>8:00 a 12:00</strong> y
                  de <strong>14:00 a 19:00</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* Compras online con delivery */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Compras online con entrega a domicilio</h2>
            <p className="text-foreground-secondary mb-4">
              Las entregas de flores para días <strong>Sábado, Domingo y Feriados</strong> deben ser agendadas
              al menos con <strong>48 horas</strong> de anticipación.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 text-sm">
                  Si el cliente pasa por alto nuestros Términos y Condiciones y realiza la compra en los días
                  mencionados, la entrega del arreglo floral se la realizará el día laborable más próximo en el
                  rango de horario de 9:30 a 14:00.
                </p>
              </div>
            </div>
          </section>

          {/* Retiro en tienda */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Retiro en tienda</h2>
            <p className="text-foreground-secondary mb-4">
              Si el cliente desea realizar una compra en nuestra página web pero desea retirar el diseño floral,
              lo podrá hacer.
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>
                <strong>Días normales:</strong> Los pedidos online con retiro en tienda deberán ser gestionados y
                agendados con <strong>24 horas</strong> de anticipación al día de la entrega.
              </li>
              <li>
                <strong>Fines de semana o feriados:</strong> Deberán ser gestionados y agendados de
                <strong> 48 a 72 horas</strong> de anticipación.
              </li>
            </ul>
          </section>

          {/* Horarios de atención en tiendas */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Horarios de atención en tiendas</h2>
            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-medium">Encanto Floristería Manta</p>
                <p className="text-foreground-secondary text-sm">Lunes a Sábados: 8:00 - 19:00</p>
                <p className="text-foreground-secondary text-sm">Domingos: con previa cita</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-medium">Encanto Floristería Quevedo</p>
                <p className="text-foreground-secondary text-sm">Lunes a Sábados: 8:00 - 18:00</p>
                <p className="text-foreground-secondary text-sm">Domingos: con previa cita</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-4">
                <p className="font-medium">Encanto Floristería Valencia</p>
                <p className="text-foreground-secondary text-sm">Lunes a Sábados: 8:00 - 18:00</p>
                <p className="text-foreground-secondary text-sm">Domingos: con previa cita</p>
              </div>
            </div>
            <p className="text-foreground-secondary text-sm mt-4">
              Horario de atención vía WhatsApp: 8:00 a 20:00
            </p>
          </section>

          {/* Si el receptor no está */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Si el receptor no está en casa</h2>

            <h3 className="text-lg font-medium mb-2">Si hay familiares presentes</h3>
            <p className="text-foreground-secondary mb-4">
              En el caso de que el destinatario no se encuentre en la dirección proporcionada al momento de la
              entrega, pero sí se encuentren familiares o personal de servicio, se procederá a realizar la entrega
              y se enviará la respectiva orden de recepción al cliente.
            </p>

            <h3 className="text-lg font-medium mb-2">Si no hay nadie quien reciba</h3>
            <p className="text-foreground-secondary mb-4">
              Si al momento de la entrega no hay nadie quien pueda recibir el producto y/o no se permita dejarlo,
              el Delivery de ENCANTO FLORISTERÍA continuará su ruta de entregas y cuando regrese a nuestra tienda
              matriz, retornará el producto. El cliente podrá retirarlo sin recargo alguno, o podrá cancelar el
              costo de un nuevo envío a domicilio sujeto a disponibilidad de horarios.
            </p>
            <p className="text-foreground-secondary mb-4">
              Si el diseño floral que volvió a nuestra tienda matriz no es retirado ni agendada su nueva entrega,
              ENCANTO FLORISTERÍA no se hace responsable por el estado del diseño floral. El cliente entiende que
              trabajamos con flores y estas son perecederas y no habrá reembolso económico ni nota de crédito.
            </p>
          </section>

          {/* Información incorrecta */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Error o falta de datos en la información</h2>
            <p className="text-foreground-secondary mb-4">
              Comunicaremos el particular al cliente, retornaremos el producto a la tienda matriz y el cliente
              podrá retirarlo sin recargo alguno. Es deber del cliente proporcionar a ENCANTO FLORISTERÍA la
              información correcta del destinatario.
            </p>
            <p className="text-foreground-secondary">
              Si el diseño floral que volvió a nuestra tienda matriz no es retirado ni agendada su nueva entrega,
              ENCANTO FLORISTERÍA no se hace responsable por el estado del diseño floral. El cliente entiende que
              trabajamos con flores y estas son perecederas y no habrá reembolso económico ni nota de crédito.
            </p>
          </section>

          {/* Receptor no desea recibir */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Si el receptor no desea recibir el producto</h2>
            <p className="text-foreground-secondary mb-4">
              Hay muchos factores por los cuales un cliente (destinatario) puede no querer recibir un diseño floral.
              ENCANTO FLORISTERÍA es ajeno a eso y comunicará el particular al cliente. El diseño floral regresará
              a nuestra tienda matriz; el cliente podrá retirarlo sin recargo alguno o puede solicitar nuestro
              servicio de entregas con un valor adicional y sujeto a disponibilidad de horarios para enviarlo a
              otra dirección.
            </p>
            <p className="text-foreground-secondary">
              Si el diseño floral que volvió a nuestra tienda matriz no es retirado ni agendada su nueva entrega,
              ENCANTO FLORISTERÍA no se hace responsable por el estado del diseño floral. El cliente entiende que
              trabajamos con flores y estas son perecederas y no habrá reembolso económico ni nota de crédito.
            </p>
          </section>

          <p className="text-foreground-secondary text-sm">
            Consulte también nuestros{" "}
            <Link href="/terminos" className="text-primary hover:underline">
              Términos y Condiciones
            </Link>{" "}
            para información sobre pagos, facturación, reclamos y cancelaciones.
          </p>

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
