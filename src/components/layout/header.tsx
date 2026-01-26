"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, Search, User, LogOut, LogIn, UserPlus, UserCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { SearchDialog } from "@/components/search-dialog";
import { AuthModal } from "@/components/auth-modal";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Catálogo", href: "/productos" },
  { name: "Categorías", href: "/categorias" },
  { name: "Nosotros", href: "/nosotros" },
  { name: "Contacto", href: "/contacto" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { totalItems, openCart } = useCartStore();
  const { user, logout } = useAuthStore();

  // Prevent hydration mismatch by only showing cart count after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const itemCount = mounted ? totalItems() : 0;
  const displayUser = mounted ? user : null;

  const handleOpenLogin = () => {
    setAuthModalMode("login");
    setAuthModalOpen(true);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleOpenRegister = () => {
    setAuthModalMode("register");
    setAuthModalOpen(true);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Encanto"
                width={120}
                height={40}
                className="h-8 sm:h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground-secondary hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Buscar</span>
            </Button>

            {/* User button / dropdown */}
            <div className="relative hidden sm:block" ref={userMenuRef}>
              {displayUser ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="relative"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {displayUser.avatarUrl ? (
                        <Image
                          src={displayUser.avatarUrl}
                          alt={displayUser.fullName}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          {displayUser.fullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </Button>

                  {/* User dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border py-1 z-50">
                      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {displayUser.avatarUrl ? (
                            <Image
                              src={displayUser.avatarUrl}
                              alt={displayUser.fullName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-primary">
                              {displayUser.fullName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{displayUser.fullName}</p>
                          <p className="text-xs text-foreground-secondary truncate">
                            {displayUser.email}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <UserCircle className="h-4 w-4" />
                        Mi Perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground-secondary hover:text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <User className="h-5 w-5" />
                    <span className="sr-only">Cuenta</span>
                  </Button>

                  {/* Guest dropdown menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-border py-1 z-50">
                      <button
                        onClick={handleOpenLogin}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <LogIn className="h-4 w-4" />
                        Iniciar sesión
                      </button>
                      <button
                        onClick={handleOpenRegister}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        <UserPlus className="h-4 w-4" />
                        Crear cuenta
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Cart button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[11px] font-medium text-white flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
              <span className="sr-only">Carrito</span>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileMenuOpen ? "max-h-[400px] pb-4" : "max-h-0"
          )}
        >
          <div className="space-y-1 pt-2">
            {/* Mobile Search Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-base font-medium text-foreground-secondary hover:text-primary hover:bg-secondary rounded-lg transition-colors"
            >
              <Search className="h-5 w-5" />
              Buscar productos
            </button>

            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-foreground-secondary hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t border-border my-2" />

            {/* Mobile User Section */}
            {displayUser ? (
              <>
                <div className="px-3 py-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {displayUser.avatarUrl ? (
                      <Image
                        src={displayUser.avatarUrl}
                        alt={displayUser.fullName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-primary">
                        {displayUser.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{displayUser.fullName}</p>
                    <p className="text-xs text-foreground-secondary">{displayUser.email}</p>
                  </div>
                </div>
                <Link
                  href="/perfil"
                  className="w-full flex items-center gap-3 px-3 py-2 text-base font-medium text-foreground-secondary hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircle className="h-5 w-5" />
                  Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-base font-medium text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleOpenLogin}
                  className="w-full flex items-center gap-3 px-3 py-2 text-base font-medium text-foreground-secondary hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  Iniciar sesión
                </button>
                <button
                  onClick={handleOpenRegister}
                  className="w-full flex items-center gap-3 px-3 py-2 text-base font-medium text-foreground-secondary hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  Crear cuenta
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Search Dialog */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  );
}
