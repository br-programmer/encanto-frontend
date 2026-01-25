import Image from "next/image";
import Link from "next/link";
import { Heart, Leaf, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata = {
  title: "Nosotros | Encanto Florería",
  description: "Conoce nuestra historia y pasión por las flores. En Encanto Florería creamos arreglos únicos con amor y dedicación.",
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
              <h1 className="text-4xl lg:text-5xl font-serif mb-6">
                Nuestra Historia
              </h1>
              <p className="text-lg text-foreground-secondary mb-6 leading-relaxed">
                Encanto Florería nació de una pasión profunda por las flores y el deseo
                de llevar alegría a cada hogar en Manta. Desde nuestros inicios, nos hemos
                dedicado a crear arreglos florales únicos que transmiten emociones y
                celebran los momentos más especiales de la vida.
              </p>
              <p className="text-lg text-foreground-secondary mb-8 leading-relaxed">
                Cada ramo que creamos cuenta una historia. Seleccionamos cuidadosamente
                las flores más frescas y combinamos colores, texturas y aromas para
                crear obras de arte naturales que encantan a quienes las reciben.
              </p>
              <Button size="lg" asChild>
                <Link href="/productos">Ver nuestros productos</Link>
              </Button>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
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
            <div className="text-center p-6 bg-white rounded-xl">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Pasión</h3>
              <p className="text-foreground-secondary text-sm">
                Amamos lo que hacemos y eso se refleja en cada detalle de nuestros arreglos.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Frescura</h3>
              <p className="text-foreground-secondary text-sm">
                Solo trabajamos con flores frescas de la más alta calidad.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Calidad</h3>
              <p className="text-foreground-secondary text-sm">
                Nos comprometemos con la excelencia en cada arreglo que creamos.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-xl">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Servicio</h3>
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
