import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl sm:text-9xl font-serif text-primary/20 mb-4">404</h1>
        <h2 className="text-2xl font-serif mb-3">Página no encontrada</h2>
        <p className="text-foreground-secondary text-sm mb-8">
          Lo sentimos, la página que buscas no existe o fue movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/productos">Ver productos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
