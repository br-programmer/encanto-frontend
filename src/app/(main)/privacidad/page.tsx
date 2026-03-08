import { Breadcrumb } from "@/components/breadcrumb";

export const metadata = {
  title: "Política de Privacidad | Encanto Florería",
  description: "Política de privacidad de Encanto Florería. Conoce cómo recopilamos, usamos y protegemos tu información personal.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Política de Privacidad" }]} />

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif mb-8">Política de Privacidad</h1>

        <div className="prose prose-neutral max-w-none">
          <p className="text-foreground-secondary mb-6">
            Última actualización: Enero 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">1. Introducción</h2>
            <p className="text-foreground-secondary mb-4">
              En Encanto Florería nos comprometemos a proteger la privacidad de nuestros clientes. Esta Política
              de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos su información personal
              cuando utiliza nuestro sitio web y servicios.
            </p>
            <p className="text-foreground-secondary mb-4">
              Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">2. Información que Recopilamos</h2>

            <h3 className="text-lg font-semibold mb-2">2.1 Información proporcionada por usted</h3>
            <p className="text-foreground-secondary mb-4">
              Recopilamos la información que usted nos proporciona directamente, incluyendo:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>Nombre completo</li>
              <li>Dirección de entrega</li>
              <li>Número de teléfono</li>
              <li>Correo electrónico</li>
              <li>Información de pago (procesada de forma segura)</li>
              <li>Mensajes para las tarjetas de dedicatoria</li>
              <li>Información del destinatario de los arreglos</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">2.2 Información recopilada automáticamente</h3>
            <p className="text-foreground-secondary mb-4">
              Cuando visita nuestro sitio web, podemos recopilar automáticamente:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>Dirección IP</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Páginas visitadas y tiempo de permanencia</li>
              <li>Fecha y hora de acceso</li>
              <li>Información de cookies (ver sección 6)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">3. Uso de la Información</h2>
            <p className="text-foreground-secondary mb-4">
              Utilizamos su información personal para:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>Procesar y entregar sus pedidos</li>
              <li>Comunicarnos con usted sobre su pedido</li>
              <li>Enviar confirmaciones y actualizaciones de entrega</li>
              <li>Responder a sus consultas y solicitudes</li>
              <li>Mejorar nuestros productos y servicios</li>
              <li>Enviar información promocional (solo con su consentimiento)</li>
              <li>Cumplir con obligaciones legales y fiscales</li>
              <li>Prevenir fraudes y actividades ilícitas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">4. Compartición de Información</h2>
            <p className="text-foreground-secondary mb-4">
              No vendemos ni alquilamos su información personal a terceros. Podemos compartir su información
              únicamente en las siguientes circunstancias:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>
                <strong>Servicios de entrega:</strong> Compartimos la dirección y datos de contacto necesarios
                para realizar la entrega de su pedido.
              </li>
              <li>
                <strong>Procesadores de pago:</strong> Su información de pago es procesada de forma segura por
                proveedores de servicios de pago certificados.
              </li>
              <li>
                <strong>Requerimientos legales:</strong> Cuando sea requerido por ley o para proteger nuestros
                derechos legales.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">5. Seguridad de la Información</h2>
            <p className="text-foreground-secondary mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal
              contra acceso no autorizado, pérdida, alteración o divulgación. Estas medidas incluyen:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>Encriptación SSL en todas las transmisiones de datos</li>
              <li>Acceso restringido a información personal</li>
              <li>Monitoreo regular de nuestros sistemas</li>
              <li>Capacitación del personal en protección de datos</li>
            </ul>
            <p className="text-foreground-secondary mb-4">
              Sin embargo, ningún método de transmisión por Internet es 100% seguro. No podemos garantizar
              la seguridad absoluta de su información.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">6. Cookies</h2>
            <p className="text-foreground-secondary mb-4">
              Nuestro sitio web utiliza cookies para mejorar su experiencia de navegación. Las cookies son
              pequeños archivos de texto que se almacenan en su dispositivo. Utilizamos:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>
                <strong>Cookies esenciales:</strong> Necesarias para el funcionamiento del sitio web y el
                proceso de compra.
              </li>
              <li>
                <strong>Cookies de preferencias:</strong> Recuerdan sus preferencias como el carrito de compras.
              </li>
              <li>
                <strong>Cookies analíticas:</strong> Nos ayudan a entender cómo los visitantes usan nuestro sitio.
              </li>
            </ul>
            <p className="text-foreground-secondary mb-4">
              Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la funcionalidad
              del sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">7. Sus Derechos</h2>
            <p className="text-foreground-secondary mb-4">
              Usted tiene derecho a:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>Acceder a su información personal que tenemos almacenada</li>
              <li>Solicitar la corrección de datos inexactos</li>
              <li>Solicitar la eliminación de sus datos personales</li>
              <li>Oponerse al procesamiento de sus datos para fines de marketing</li>
              <li>Retirar su consentimiento en cualquier momento</li>
            </ul>
            <p className="text-foreground-secondary mb-4">
              Para ejercer estos derechos, contáctenos a través de los medios indicados al final de esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">8. Retención de Datos</h2>
            <p className="text-foreground-secondary mb-4">
              Conservamos su información personal durante el tiempo necesario para cumplir con los fines
              descritos en esta política, a menos que la ley requiera un período de retención más largo.
              Los datos de transacciones se conservan por el período requerido para fines fiscales y contables.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">9. Menores de Edad</h2>
            <p className="text-foreground-secondary mb-4">
              Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente
              información personal de menores. Si descubrimos que hemos recopilado información de un menor,
              la eliminaremos inmediatamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">10. Cambios a esta Política</h2>
            <p className="text-foreground-secondary mb-4">
              Podemos actualizar esta Política de Privacidad periódicamente. Los cambios se publicarán en
              esta página con una nueva fecha de actualización. Le recomendamos revisar esta política
              regularmente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">11. Contacto</h2>
            <p className="text-foreground-secondary mb-4">
              Si tiene preguntas sobre esta Política de Privacidad o sobre cómo manejamos su información
              personal, puede contactarnos a través de:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
              <li>Teléfono: 098 274 2191</li>
              <li>Instagram: @encanto_ecu</li>
              <li>Dirección: Calle 22, Manta, Ecuador</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
