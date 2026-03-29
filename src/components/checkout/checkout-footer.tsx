import Link from "next/link";

export function CheckoutFooter() {
  return (
    <footer className="bg-background border-t border-border py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground-secondary">
          {/* Copyright */}
          <p>© {new Date().getFullYear()} Encanto Floristería</p>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/terminos" className="hover:text-primary transition-colors">
              Términos
            </Link>
            <Link href="/privacidad" className="hover:text-primary transition-colors">
              Privacidad
            </Link>
            <Link href="/envios" className="hover:text-primary transition-colors">
              Envíos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
