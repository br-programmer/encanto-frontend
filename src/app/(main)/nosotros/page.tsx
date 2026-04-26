import Image from "next/image";
import Link from "next/link";
import { Heart, Leaf, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata = {
  title: "Nosotros | Encanto Floristería",
  description: "Conoce nuestra historia y pasión por las flores. En Encanto Floristería creamos arreglos únicos con amor y dedicación.",
};

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Nosotros" }]} />

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-wider text-primary mb-3">
                Nuestra historia
              </p>
              <h1 className="text-4xl lg:text-5xl font-serif mb-6">
                Una historia que empezó con una idea diferente
              </h1>
              <p className="text-lg text-foreground-secondary mb-6 leading-relaxed">
                Hace casi tres años empezamos buscando hacer algo distinto al resto.
                Sin técnicas, sin experiencia y con mucha curiosidad — solo videos
                de internet, inspiración de Pinterest y unas ganas enormes de crear.
              </p>
              <p className="text-lg text-foreground-secondary mb-8 leading-relaxed">
                Hoy, cada arreglo que sale de nuestro taller lleva años de práctica,
                aprendizaje y mucha confianza ganada con cada cliente que decidió
                creer en nosotros desde el principio.
              </p>
              <Button size="lg" asChild>
                <Link href="/productos">Ver nuestros productos</Link>
              </Button>
            </div>
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden">
              <Image
                src="https://picsum.photos/seed/floreria/800/600"
                alt="Nuestra florería"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story timeline */}
      <section className="py-16 bg-warm-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <h2 className="text-2xl font-serif mb-4">Los primeros intentos</h2>
            <p className="text-foreground-secondary leading-relaxed">
              Todo empezó queriendo hacer ramos con frutas, porque era algo que
              nadie hacía. La realidad fue que era muy complicado, había mucha
              pérdida y todavía no teníamos la técnica. Pero a pesar de las
              críticas, seguimos.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif mb-4">Encontrando el camino</h2>
            <p className="text-foreground-secondary leading-relaxed">
              Un día fuimos al centro a buscar rosas y, casi por casualidad, una
              señora nos contó cuándo llegaba el distribuidor. Volvimos al día
              siguiente, compramos nuestras primeras rosas y nos pusimos a
              armar un ramo enorme con la guía de una tía. Ese ramo aún le
              faltaba técnica, pero para nosotros era el comienzo.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif mb-4">El detalle innovador</h2>
            <p className="text-foreground-secondary leading-relaxed">
              Quisimos sumar flores dentro de globo, un detalle que nos parecía
              precioso pero que nadie nos podía enseñar. Mi mamá se tomó meses
              en perfeccionar la técnica. El día que se fue de Manta me enseñó
              todo lo que sabía, y de los primeros prototipos —algunos
              dañados— salió finalmente nuestro primer globo perfecto.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif mb-4">Llegando a Manta</h2>
            <p className="text-foreground-secondary leading-relaxed">
              Las primeras semanas fueron lentas, con pocas ventas y deudas
              que pagar. Hasta que llegó el primer pedido grande: 50 rosas en
              forma de corazón, más grandes de lo que habíamos hecho nunca.
              Pasamos toda la noche armándolo, rosa por rosa, y el resultado
              fue justo lo que el cliente buscaba.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-serif mb-4">Creciendo con cada cliente</h2>
            <p className="text-foreground-secondary leading-relaxed">
              Cada pedido nuevo nos llevó a probar diseños que nunca habíamos
              hecho. Confiar en nosotros cuando solo teníamos una foto de
              referencia nos enseñó que con dedicación y mucho trabajo, sí se
              podía. Hoy seguimos creando con esa misma energía: detalles
              pensados con cariño, hechos a tiempo y siempre con flores frescas.
            </p>
          </div>

          <div className="border-t border-border pt-8">
            <p className="text-foreground-secondary leading-relaxed italic">
              Gracias a cada persona que nos ha apoyado, motivado y confiado en
              nosotros estos años: a nuestra familia, amigos, clientes y a ti
              que nos conoces a través de redes. Sin ustedes, Encanto no
              existiría.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-4">Nuestros Valores</h2>
            <p className="text-foreground-secondary max-w-2xl mx-auto">
              Los principios que guían cada arreglo que creamos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-background rounded-xl">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Pasión</h3>
              <p className="text-foreground-secondary text-sm">
                Amamos lo que hacemos y eso se refleja en cada detalle de nuestros arreglos.
              </p>
            </div>

            <div className="text-center p-6 bg-background rounded-xl">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Frescura</h3>
              <p className="text-foreground-secondary text-sm">
                Solo trabajamos con flores frescas de la más alta calidad.
              </p>
            </div>

            <div className="text-center p-6 bg-background rounded-xl">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Calidad</h3>
              <p className="text-foreground-secondary text-sm">
                Nos comprometemos con la excelencia en cada arreglo que creamos.
              </p>
            </div>

            <div className="text-center p-6 bg-background rounded-xl">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Servicio</h3>
              <p className="text-foreground-secondary text-sm">
                Tu satisfacción es nuestra prioridad. Estamos aquí para ayudarte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="p-8 bg-warm-white rounded-2xl">
              <h3 className="text-2xl font-serif mb-4">Nuestra Misión</h3>
              <p className="text-foreground-secondary leading-relaxed">
                Crear momentos memorables a través de arreglos florales únicos y
                personalizados, entregando no solo flores, sino emociones y alegría
                a cada hogar en Manta y sus alrededores.
              </p>
            </div>

            <div className="p-8 bg-warm-white rounded-2xl">
              <h3 className="text-2xl font-serif mb-4">Nuestra Visión</h3>
              <p className="text-foreground-secondary leading-relaxed">
                Ser la florería de referencia en la región, reconocida por la
                calidad de nuestros productos, la creatividad de nuestros diseños
                y la calidez de nuestro servicio al cliente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif text-white mb-4">
            ¿Listo para sorprender a alguien especial?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Explora nuestra colección de arreglos florales y encuentra el regalo perfecto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/productos">Ver Productos</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
              <Link href="/contacto">Contáctanos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
