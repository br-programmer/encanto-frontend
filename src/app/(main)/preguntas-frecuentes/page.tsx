import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import { FaqAccordion } from "@/components/faq-accordion";

export const metadata = {
  title: "Preguntas Frecuentes | Encanto Florería",
  description: "Encuentra respuestas a las preguntas más comunes sobre nuestros productos, envíos, pagos y más.",
};

const faqs = [
  {
    category: "Pedidos y Envíos",
    questions: [
      {
        question: "¿Cuál es el tiempo de entrega?",
        answer: "Realizamos entregas el mismo día para pedidos confirmados antes de las 2:00 PM. Los pedidos después de esa hora se entregan al día siguiente. Para fechas especiales como San Valentín o Día de la Madre, te recomendamos hacer tu pedido con anticipación."
      },
      {
        question: "¿Hacen entregas los domingos?",
        answer: "No, los domingos permanecemos cerrados. Si necesitas una entrega para domingo, puedes coordinarla para el sábado anterior o el lunes siguiente."
      },
      {
        question: "¿Cuál es el costo de envío?",
        answer: "El costo de envío varía según la zona de entrega en Manta. Durante el proceso de compra podrás ver el costo exacto según tu dirección. Para zonas fuera de nuestra cobertura, contáctanos para coordinar."
      },
      {
        question: "¿Puedo programar una entrega para una fecha específica?",
        answer: "¡Sí! Puedes programar tu entrega para la fecha y hora que prefieras. Solo selecciona la fecha deseada durante el proceso de compra o indícalo en los comentarios del pedido."
      },
      {
        question: "¿Entregan fuera de Manta?",
        answer: "Actualmente nuestro servicio de entrega cubre Manta y zonas aledañas. Para entregas fuera de esta área, contáctanos por WhatsApp para verificar disponibilidad y costos adicionales."
      }
    ]
  },
  {
    category: "Productos",
    questions: [
      {
        question: "¿Las flores son frescas?",
        answer: "¡Absolutamente! Trabajamos únicamente con flores frescas que seleccionamos cuidadosamente cada día. Nuestros arreglos se preparan al momento de tu pedido para garantizar la máxima frescura y duración."
      },
      {
        question: "¿Puedo personalizar un arreglo?",
        answer: "¡Por supuesto! Nos encanta crear arreglos personalizados. Contáctanos por WhatsApp con tus ideas, colores preferidos, ocasión y presupuesto, y crearemos algo único para ti."
      },
      {
        question: "¿Cuánto duran las flores?",
        answer: "Con el cuidado adecuado, nuestros arreglos pueden durar entre 7 y 14 días. Incluimos una tarjeta con instrucciones de cuidado en cada entrega para que disfrutes tus flores por más tiempo."
      },
      {
        question: "¿Qué hago si las flores llegaron maltratadas?",
        answer: "Tu satisfacción es nuestra prioridad. Si las flores llegan en mal estado, contáctanos inmediatamente con fotos del arreglo y lo resolveremos. Puedes enviarnos un WhatsApp o llamarnos al 098 274 2191."
      },
      {
        question: "¿Puedo agregar chocolates u otros complementos?",
        answer: "Sí, ofrecemos varios complementos como chocolates, peluches, globos y tarjetas personalizadas. Puedes agregarlos durante el proceso de compra o solicitarlos por WhatsApp."
      }
    ]
  },
  {
    category: "Pagos",
    questions: [
      {
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos transferencias bancarias, depósitos, tarjetas de crédito/débito y pagos en efectivo contra entrega (solo en Manta). Para pagos con tarjeta, utilizamos una plataforma segura."
      },
      {
        question: "¿Puedo pagar contra entrega?",
        answer: "Sí, ofrecemos pago contra entrega en efectivo para pedidos dentro de Manta. El monto exacto debe estar disponible ya que nuestros repartidores no manejan cambio."
      },
      {
        question: "¿Emiten factura?",
        answer: "Sí, emitimos factura electrónica. Solo necesitas proporcionarnos tus datos fiscales (nombre/razón social, RUC/cédula, dirección y correo electrónico) al momento de realizar tu pedido."
      }
    ]
  },
  {
    category: "Ocasiones Especiales",
    questions: [
      {
        question: "¿Hacen arreglos para eventos corporativos?",
        answer: "Sí, realizamos arreglos para eventos corporativos, inauguraciones, conferencias y más. Contáctanos con anticipación para discutir tus necesidades y presupuesto."
      },
      {
        question: "¿Ofrecen servicio para bodas?",
        answer: "¡Sí! Creamos bouquets de novia, arreglos para ceremonia, centros de mesa y toda la decoración floral para tu boda. Agenda una cita con nosotros para planificar cada detalle."
      },
      {
        question: "¿Tienen promociones para fechas especiales?",
        answer: "Sí, en fechas como San Valentín, Día de la Madre y otras ocasiones especiales ofrecemos promociones y productos exclusivos. Síguenos en Instagram @encanto_ecu para enterarte de todas nuestras ofertas."
      },
      {
        question: "¿Puedo incluir una tarjeta con mensaje?",
        answer: "¡Claro! Todos nuestros arreglos incluyen una tarjeta de dedicatoria sin costo adicional. Puedes escribir tu mensaje personalizado durante el proceso de compra."
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
                href="https://wa.me/593982742191?text=Hola!%20Tengo%20una%20pregunta"
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
