import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SpecialDateNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-4xl font-serif mb-4">Fecha especial no encontrada</h1>
        <p className="text-foreground-secondary mb-8 max-w-md mx-auto">
          La campaña que buscas no existe o ya finalizó.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/productos">Ver productos</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
