import { Breadcrumb } from "@/components/breadcrumb";
import { BUSINESS } from "@/lib/constants";

export const metadata = {
  title: "Política de Privacidad | Encanto Floristería",
  description: "Política de privacidad y confidencialidad de Encanto Floristería. Conoce cómo protegemos tu información personal.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Política de Privacidad" }]} />

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif mb-4">Política de Privacidad y Confidencialidad</h1>

        <div className="prose prose-neutral max-w-none">
          <p className="text-foreground-secondary mb-8 text-lg leading-relaxed">
            En Encanto Floristería, entendemos que detrás de cada pedido hay una historia, un sentimiento
            y una persona especial. Por ello, tratamos tus datos personales con la misma delicadeza y
            respeto con la que diseñamos nuestros arreglos.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">1. Compromiso de Uso Interno</h2>
            <p className="text-foreground-secondary mb-4">
              Tu privacidad es absoluta. En Encanto Floristería no vendemos, no intercambiamos, ni
              transferimos tu información personal a empresas externas, marcas de publicidad o terceros.
            </p>
            <p className="text-foreground-secondary mb-4">
              Toda la información recopilada se maneja de forma estrictamente interna, con el único
              propósito de gestionar la personalización de tus detalles, coordinar nuestras rutas de
              entrega y garantizar que tu experiencia sea impecable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">2. Información Necesaria</h2>
            <p className="text-foreground-secondary mb-4">
              Para procesar tus pedidos de ramos, flores, detalles personalizados y logística
              de eventos, solicitamos únicamente:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-3 mb-4">
              <li>
                <strong>Identificación:</strong> Nombre y contacto del comprador.
              </li>
              <li>
                <strong>Logística:</strong> Dirección exacta y teléfono del destinatario para asegurar
                una entrega perfecta.
              </li>
              <li>
                <strong>Personalización:</strong> Mensajes para tarjetas y especificaciones para
                detalles únicos.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">3. Seguridad de Pagos</h2>
            <p className="text-foreground-secondary mb-4">
              Aunque operamos internamente, las transacciones económicas se realizan a través de
              plataformas de pago certificadas. Esto significa que los datos de tus tarjetas son
              encriptados y procesados externamente por expertos en seguridad bancaria; nosotros
              nunca tenemos acceso a tus claves o números de tarjeta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">4. Contacto</h2>
            <p className="text-foreground-secondary mb-4">
              Si tienes preguntas sobre esta política o sobre cómo manejamos tu información
              personal, puedes contactarnos a través de:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2">
              <li>
                Teléfono:{" "}
                <a
                  href={`tel:${BUSINESS.phone.raw}`}
                  className="text-primary hover:underline"
                >
                  {BUSINESS.phone.display}
                </a>
              </li>
              <li>Instagram: <a href={BUSINESS.social.instagram.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{BUSINESS.social.instagram.handle}</a></li>
              <li>
                Dirección:{" "}
                <a
                  href={BUSINESS.maps.placeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {BUSINESS.address.full}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
