import Link from "next/link";
import { Instagram, Phone, MapPin } from "lucide-react";

const footerLinks = {
  tienda: [
    { name: "Catálogo", href: "/productos" },
    { name: "Categorías", href: "/categorias" },
  ],
  empresa: [
    { name: "Nosotros", href: "/nosotros" },
    { name: "Contacto", href: "/contacto" },
    { name: "Preguntas Frecuentes", href: "/preguntas-frecuentes" },
  ],
  legal: [
    { name: "Términos y Condiciones", href: "/terminos" },
    { name: "Política de Privacidad", href: "/privacidad" },
    { name: "Política de Envíos", href: "/envios" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-background-alt border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-2xl sm:text-3xl font-serif text-logo-primary">
                Encanto
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-foreground-secondary">
              Arreglos florales para toda ocasión. Hacemos de cada momento algo
              especial.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/encantofloristeria_ecu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-secondary hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Tienda
            </h3>
            <ul className="space-y-3">
              {footerLinks.tienda.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Empresa
            </h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground-secondary hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-foreground-secondary">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Calle 22, Manta, Ecuador</span>
              </li>
              <li>
                <a
                  href="tel:+593982742191"
                  className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>098 274 2191</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/encantofloristeria_ecu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-foreground-secondary hover:text-primary transition-colors"
                >
                  <Instagram className="h-4 w-4 flex-shrink-0" />
                  <span>@encantofloristeria_ecu</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-foreground-secondary text-center md:text-left">
              © {new Date().getFullYear()} Encanto Florería. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs text-foreground-muted hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
