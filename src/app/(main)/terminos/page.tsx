import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata = {
  title: "Términos y Condiciones | Encanto Florería",
  description: "Términos y condiciones de uso de Encanto Florería. Conoce las reglas y políticas que rigen nuestros servicios.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Términos y Condiciones" }]} />

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif mb-8">Términos y Condiciones</h1>

        <div className="prose prose-neutral max-w-none">
          <p className="text-foreground-secondary mb-6">
            Última actualización: Enero 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">1. Aceptación de los Términos</h2>
            <p className="text-foreground-secondary mb-4">
              Al acceder y utilizar el sitio web de Encanto Florería y realizar compras a través de nuestra plataforma,
              usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte de estos
              términos, le recomendamos no utilizar nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">2. Descripción del Servicio</h2>
            <p className="text-foreground-secondary mb-4">
              Encanto Florería es una empresa dedicada a la venta y entrega de arreglos florales, plantas y productos
              relacionados en la ciudad de Manta, Ecuador y zonas aledañas. Nuestros servicios incluyen:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>Venta de arreglos florales y plantas</li>
              <li>Servicio de entrega a domicilio</li>
              <li>Arreglos personalizados bajo pedido</li>
              <li>Servicios para eventos especiales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">3. Pedidos y Pagos</h2>
            <h3 className="text-lg font-medium mb-2">3.1 Realización de Pedidos</h3>
            <p className="text-foreground-secondary mb-4">
              Los pedidos pueden realizarse a través de nuestra página web, WhatsApp o de forma presencial en nuestra
              tienda. Todo pedido está sujeto a disponibilidad de productos.
            </p>

            <h3 className="text-lg font-medium mb-2">3.2 Precios</h3>
            <p className="text-foreground-secondary mb-4">
              Los precios mostrados en nuestro sitio web están en dólares estadounidenses (USD) e incluyen IVA.
              Nos reservamos el derecho de modificar los precios sin previo aviso.
            </p>

            <h3 className="text-lg font-medium mb-2">3.3 Métodos de Pago</h3>
            <p className="text-foreground-secondary mb-4">
              Aceptamos los siguientes métodos de pago:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>Transferencia bancaria</li>
              <li>Depósito bancario</li>
              <li>Tarjetas de crédito y débito</li>
              <li>Efectivo contra entrega (solo en Manta)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">4. Entregas</h2>
            <p className="text-foreground-secondary mb-4">
              Las condiciones de entrega se detallan en nuestra{" "}
              <Link href="/envios" className="text-primary hover:underline">
                Política de Envíos
              </Link>
              . Al realizar un pedido, usted acepta las condiciones establecidas en dicha política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">5. Política de Cambios y Devoluciones</h2>
            <p className="text-foreground-secondary mb-4">
              Debido a la naturaleza perecedera de nuestros productos, no aceptamos devoluciones una vez entregado
              el pedido. Sin embargo, si el producto llega en mal estado o no corresponde a lo solicitado,
              contáctenos inmediatamente con fotografías del producto para evaluar su caso.
            </p>
            <p className="text-foreground-secondary mb-4">
              Las reclamaciones deben realizarse dentro de las primeras 2 horas después de la entrega.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">6. Sustitución de Flores</h2>
            <p className="text-foreground-secondary mb-4">
              Debido a la disponibilidad estacional de ciertas flores, nos reservamos el derecho de sustituir
              flores o elementos del arreglo por otros de igual o mayor valor, manteniendo el estilo y la
              paleta de colores del arreglo original. En caso de sustituciones significativas, le contactaremos
              para su aprobación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">7. Cancelaciones</h2>
            <p className="text-foreground-secondary mb-4">
              Las cancelaciones deben realizarse con al menos 24 horas de anticipación a la fecha de entrega
              programada para obtener un reembolso completo. Las cancelaciones realizadas con menos de 24 horas
              de anticipación pueden estar sujetas a un cargo del 50% del valor del pedido.
            </p>
            <p className="text-foreground-secondary mb-4">
              No se aceptan cancelaciones una vez que el arreglo ha sido preparado o está en camino.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">8. Propiedad Intelectual</h2>
            <p className="text-foreground-secondary mb-4">
              Todo el contenido de este sitio web, incluyendo pero no limitado a textos, imágenes, logotipos,
              diseños y código, es propiedad de Encanto Florería y está protegido por las leyes de propiedad
              intelectual. Queda prohibida su reproducción sin autorización expresa.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">9. Limitación de Responsabilidad</h2>
            <p className="text-foreground-secondary mb-4">
              Encanto Florería no será responsable por daños indirectos, incidentales o consecuentes que
              resulten del uso de nuestros servicios. Nuestra responsabilidad máxima se limita al valor
              del pedido en cuestión.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">10. Modificaciones</h2>
            <p className="text-foreground-secondary mb-4">
              Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento.
              Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.
              El uso continuado de nuestros servicios constituye la aceptación de los términos modificados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">11. Contacto</h2>
            <p className="text-foreground-secondary mb-4">
              Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través de:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
              <li>Teléfono: 098 274 2191</li>
              <li>Instagram: @encantofloristeria_ecu</li>
              <li>Dirección: Calle 22, Manta, Ecuador</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
