import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";
import { BUSINESS } from "@/lib/constants";

export const metadata = {
  title: "Términos y Condiciones | Encanto Floristería",
  description: "Términos y condiciones de compra de Encanto Floristería. Políticas de pago, facturación, reclamos y cancelaciones.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Términos y Condiciones" }]} />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-serif mb-4">Términos y Condiciones</h1>
        <p className="text-foreground-secondary mb-8">
          Estimado Cliente, es importante que lea nuestras políticas, las mismas que se detallan en este documento.
          Una vez confirmada su compra, se entenderá que usted está de acuerdo y acepta las mismas.
        </p>

        <div className="prose prose-neutral max-w-none">

          {/* Al realizar una compra */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Al realizar una compra</h2>
            <p className="text-foreground-secondary mb-4">
              Al realizar una compra en ENCANTO FLORISTERÍA, el Comprador entiende lo siguiente:
            </p>
            <ol className="list-decimal pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>Puede ser necesario reemplazar follajes de los diseños florales.</li>
              <li>Reemplazar tonos de flores.</li>
              <li>Reemplazar tonos de cajas o papel.</li>
              <li>Si el caso amerita se reemplazarán flores que por temporadas estén escasas por otras de similares características.</li>
              <li>Si sucede uno de los puntos anteriores, nuestros decoradores se encargarán de cuidar los detalles y aspecto del diseño floral.</li>
            </ol>
          </section>

          {/* Formas de pago */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Formas de pago</h2>
            <p className="text-foreground-secondary mb-4">
              En ENCANTO FLORISTERÍA aceptamos las siguientes formas de pago:
            </p>
            <ul className="list-disc pl-6 text-foreground-secondary space-y-2 mb-4">
              <li>Efectivo</li>
              <li>Depósito / Transferencia Bancaria</li>
              <li>Tarjeta de Crédito y Débito</li>
              <li>Pago vía PayPal</li>
            </ul>
            <p className="text-foreground-secondary mb-4">
              Los arreglos ordenados a ENCANTO FLORISTERÍA serán elaborados y únicamente despachados una vez
              confirmado el pago en la forma escogida por el cliente.
            </p>
            <p className="text-foreground-secondary">
              Los precios de nuestros arreglos son precios finales, independiente de la forma de pago.
              Resaltando que estos no incluyen el servicio de entrega a domicilio.
            </p>
          </section>

          {/* Facturación */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Facturación</h2>
            <p className="text-foreground-secondary mb-4">
              ENCANTO FLORISTERÍA facturará toda orden ingresada por este medio o telefónicamente,
              las facturas son electrónicas por ende llegarán directamente al correo del comprador.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm font-medium">
                IMPORTANTE: No se realizarán cambios en los datos de las facturas, sean en fechas,
                remitentes o remitidos bajo ningún concepto.
              </p>
            </div>
          </section>

          {/* Reclamos */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Reclamos</h2>
            <p className="text-foreground-secondary mb-4">
              Para ENCANTO FLORISTERÍA es muy importante el control de la calidad de sus productos.
            </p>
            <p className="text-foreground-secondary mb-4">
              En caso de que el cliente manifieste una insatisfacción con la calidad del producto, el reclamo debe
              ser realizado durante las siguientes <strong>12 horas</strong> pasada la entrega del producto, telefónicamente
              y por escrito. ENCANTO FLORISTERÍA verificará que en el caso de la flor el cliente haya seguido las
              especificaciones del cuidado de la misma y lo mismo con los demás productos.
            </p>
            <p className="text-foreground-secondary mb-4">
              Una vez verificado que la responsabilidad es de ENCANTO FLORISTERÍA y si el reclamo se encuentra dentro
              del tiempo estipulado, se realizará la <strong>reposición del producto</strong> más no la devolución del dinero.
              En caso de que el cliente no desee la reposición en ese momento, se realizará una nota de crédito que
              podrá ser utilizada en el momento que el cliente lo requiera, la cual no tendrá validez en fechas altas
              como San Valentín, Día de Madres, Día de flores amarillas o temporada navideña.
            </p>
          </section>

          {/* Cancelación o re agendamiento */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Cancelación o reagendamiento</h2>
            <p className="text-foreground-secondary mb-4">
              ENCANTO FLORISTERÍA una vez receptado el pedido podrá aceptar algún cambio o desistimiento de compra
              máximo <strong>48 horas antes</strong> de la fecha agendada para la entrega del arreglo floral.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm font-medium">
                IMPORTANTE: En caso que el cliente desista de la compra por cualquier motivo, ENCANTO FLORISTERÍA
                NO REALIZARÁ DEVOLUCIONES DE DINERO. Se procederá a realizar una NOTA DE CRÉDITO para que sea
                usada cuando el cliente estime conveniente.
              </p>
            </div>
          </section>

          {/* Importante saber */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Importante saber</h2>
            <p className="text-foreground-secondary mb-4">
              Los arreglos florales naturales que retornaron a nuestra tienda matriz y no fueron retirados por
              el cliente, serán destruidos dentro de los siguientes <strong>7 días calendario</strong> y no se
              realizarán devoluciones de dinero, cambio de producto o notas de crédito.
            </p>
            <p className="text-foreground-secondary">
              Para entregas en días festivos o feriados, el cliente debe agendar su pedido con
              <strong> 48 horas (laborales)</strong> de anticipación.
            </p>
          </section>

          {/* Contacto */}
          <section className="mb-8">
            <h2 className="text-2xl font-serif mb-4">Contacto</h2>
            <p className="text-foreground-secondary mb-4">
              Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través de:
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

          <p className="text-foreground-secondary text-sm">
            También puede consultar nuestra{" "}
            <Link href="/envios" className="text-primary hover:underline">
              Política de Envíos
            </Link>{" "}
            para información sobre entregas a domicilio.
          </p>

        </div>
      </div>
    </div>
  );
}
