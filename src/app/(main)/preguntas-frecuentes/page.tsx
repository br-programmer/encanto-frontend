import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import { FaqAccordion } from "@/components/faq-accordion";
import { BUSINESS } from "@/lib/constants";

export const metadata = {
  title: "Preguntas Frecuentes | Encanto Floristería",
  description: "Encuentra respuestas a las preguntas más comunes sobre nuestros productos, envíos, pagos y más.",
};

const faqs = [
  {
    category: "Pedidos y Envíos",
    questions: [
      {
        question: "¿Cuál es el horario de entrega?",
        answer: "Nuestro rango de entregas es de 8:30 a 12:00 y de 13:00 a 19:00. Entregas fuera de este rango se podrán realizar previa coordinación. Ten en cuenta que por variables como tráfico o disponibilidad de parqueo, no podemos garantizar una hora exacta de entrega."
      },
      {
        question: "¿Hacen entregas los fines de semana y feriados?",
        answer: "Sí, pero las entregas para Sábado, Domingo y Feriados deben ser agendadas al menos con 48 horas de anticipación. Si realizas la compra en esos días sin anticipación, la entrega se hará el día laborable más próximo en horario de 9:30 a 14:00."
      },
      {
        question: "¿Cuál es el costo de envío?",
        answer: "El costo de envío no está incluido en el precio del arreglo y se calcula según la dirección de entrega. En Manta se toma como referencia nuestra tienda matriz en calle 22 y Av. Flavio Reyes. Para Portoviejo los envíos son por Manporcar ($2,50). En Quevedo y Valencia se calcula desde nuestras tiendas locales."
      },
      {
        question: "¿Puedo retirar mi pedido en tienda?",
        answer: "Sí, puedes retirar tu pedido sin costo adicional. Para días normales necesitas agendar con 24 horas de anticipación. Para fines de semana o feriados, de 48 a 72 horas de anticipación."
      },
      {
        question: "¿Qué pasa si no hay nadie en la dirección de entrega?",
        answer: "Si no hay nadie que reciba el producto, nuestro delivery continuará su ruta y retornará el arreglo a nuestra tienda. Podrás retirarlo sin costo adicional o pagar un nuevo envío. Si hay familiares o personal de servicio presentes, se realizará la entrega a ellos."
      },
      {
        question: "¿Qué sucede en fechas especiales como San Valentín o Día de la Madre?",
        answer: "En fechas importantes (San Valentín, Día de la Mujer, Día de la Madre, Día del Padre) las entregas se realizan en el transcurso del día de 8:00 a 12:00 y de 14:00 a 19:00. Te recomendamos hacer tu pedido con anticipación."
      },
      {
        question: "¿En qué ciudades tienen cobertura?",
        answer: "Actualmente tenemos tiendas y realizamos entregas en Manta, Portoviejo (vía Manporcar), Quevedo y Valencia. Para otras ciudades, contáctanos por WhatsApp."
      }
    ]
  },
  {
    category: "Productos",
    questions: [
      {
        question: "¿Las flores son frescas?",
        answer: "Trabajamos únicamente con flores frescas que seleccionamos cuidadosamente. Nuestros arreglos se preparan al momento de tu pedido para garantizar la máxima frescura y duración."
      },
      {
        question: "¿Pueden cambiar las flores de mi arreglo?",
        answer: "Sí, al realizar una compra aceptas que puede ser necesario reemplazar follajes, tonos de flores, cajas o papel. Si por temporada alguna flor está escasa, se reemplazará por otra de similares características. Nuestros decoradores se encargarán de cuidar los detalles y aspecto del diseño floral."
      },
      {
        question: "¿Puedo personalizar un arreglo?",
        answer: "Nos encanta crear arreglos personalizados. Contáctanos por WhatsApp con tus ideas, colores preferidos, ocasión y presupuesto, y crearemos algo único para ti."
      },
      {
        question: "¿Cuánto duran las flores?",
        answer: "Con el cuidado adecuado, nuestros arreglos pueden durar entre 7 y 14 días. Incluimos instrucciones de cuidado en cada entrega. Es importante recordar que las flores son perecederas."
      },
      {
        question: "¿Puedo agregar complementos a mi arreglo?",
        answer: "Sí, ofrecemos varios complementos como chocolates, peluches, globos y tarjetas personalizadas. Puedes agregarlos durante el proceso de compra o solicitarlos por WhatsApp."
      },
      {
        question: "¿Puedo incluir una tarjeta con mensaje?",
        answer: "Todos nuestros arreglos incluyen una tarjeta de dedicatoria. Puedes escribir tu mensaje personalizado durante el proceso de compra."
      }
    ]
  },
  {
    category: "Pagos y Facturación",
    questions: [
      {
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos efectivo, depósito o transferencia bancaria, tarjetas de crédito y débito, y pago vía PayPal. Los arreglos serán elaborados y despachados únicamente una vez confirmado el pago."
      },
      {
        question: "¿Los precios incluyen el envío?",
        answer: "No, los precios de nuestros arreglos son precios finales independiente de la forma de pago, pero no incluyen el servicio de entrega a domicilio. El costo de envío se calcula según la dirección de entrega."
      },
      {
        question: "¿Emiten factura?",
        answer: "Sí, facturamos toda orden ingresada por la web o telefónicamente. Las facturas son electrónicas y llegan directamente al correo del comprador. No se realizarán cambios en los datos de las facturas (fechas, remitentes o remitidos) bajo ningún concepto."
      }
    ]
  },
  {
    category: "Reclamos y Cancelaciones",
    questions: [
      {
        question: "¿Qué hago si las flores llegaron en mal estado?",
        answer: `El reclamo debe realizarse durante las siguientes 12 horas pasada la entrega, telefónicamente y por escrito con fotografías. Una vez verificada nuestra responsabilidad, se realizará la reposición del producto (no devolución de dinero). Si no deseas la reposición, se emitirá una nota de crédito. Contáctanos al ${BUSINESS.phone.display}.`
      },
      {
        question: "¿Puedo cancelar o reagendar mi pedido?",
        answer: "Puedes cambiar o cancelar tu pedido hasta 48 horas antes de la fecha agendada de entrega. En caso de cancelación, NO se realizan devoluciones de dinero, sino una nota de crédito para usar cuando lo desees."
      },
      {
        question: "¿Qué pasa si el destinatario no quiere recibir las flores?",
        answer: "ENCANTO FLORISTERÍA comunicará la situación al cliente. El arreglo regresará a la tienda y podrás retirarlo sin costo o solicitar un nuevo envío con valor adicional. Si no es retirado, no nos hacemos responsables por el estado del arreglo ya que las flores son perecederas."
      },
      {
        question: "¿Qué pasa si el arreglo vuelve a la tienda y no lo retiro?",
        answer: "Los arreglos florales que retornan a nuestra tienda y no son retirados serán destruidos dentro de los siguientes 7 días calendario. No se realizarán devoluciones de dinero, cambio de producto ni notas de crédito."
      }
    ]
  },
  {
    category: "Servicios Especiales",
    questions: [
      {
        question: "¿Ofrecen servicios para eventos y bodas?",
        answer: "Sí, ofrecemos servicios de decoración floral para bodas, eventos corporativos, propuestas y más. Puedes explorar nuestros servicios y solicitar una cotización personalizada desde nuestra sección de Servicios."
      },
      {
        question: "¿Cómo solicito una cotización para un evento?",
        answer: "Puedes completar nuestro formulario de solicitud de servicio en la web o contactarnos por WhatsApp. Cuéntanos sobre tu evento y te enviaremos una propuesta personalizada."
      },
      {
        question: "¿Tienen promociones para fechas especiales?",
        answer: `Sí, en fechas como San Valentín, Día de la Madre y otras ocasiones especiales ofrecemos productos y promociones exclusivas. Síguenos en Instagram ${BUSINESS.social.instagram.handle} para enterarte de todas nuestras novedades.`
      }
    ]
  }
];

export default function PreguntasFrecuentesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Preguntas Frecuentes" }]} />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif mb-4">Preguntas Frecuentes</h1>
          <p className="text-foreground-secondary text-lg">
            Encuentra respuestas a las preguntas más comunes sobre nuestros
            productos, envíos y servicios.
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-2xl font-serif mb-6">{section.category}</h2>
              <FaqAccordion questions={section.questions} />
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-secondary/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-serif mb-4">¿No encontraste lo que buscabas?</h2>
          <p className="text-foreground-secondary mb-6 max-w-xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos y resolveremos todas tus dudas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <a
                href={BUSINESS.whatsapp.url("Hola! Tengo una pregunta")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Escribir por WhatsApp
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contacto">Ir a Contacto</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
