"use client";

import Link from "next/link";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  // Get the parent item for mobile back button
  const parentItem = items.length > 1 ? items[items.length - 2] : null;
  const currentItem = items[items.length - 1];

  return (
    <div className={cn("bg-secondary/30", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Mobile: Back button + current page */}
        <nav className="flex sm:hidden items-center gap-2" aria-label="Breadcrumb">
          {parentItem?.href ? (
            <Link
              href={parentItem.href}
              className="flex items-center gap-1 text-foreground-secondary hover:text-primary transition-colors min-w-0"
            >
              <ChevronLeft className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">{parentItem.label}</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1 text-foreground-secondary hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">Inicio</span>
            </Link>
          )}
          <span className="text-foreground-muted">/</span>
          <span className="text-sm text-foreground font-medium truncate">
            {currentItem.label}
          </span>
        </nav>

        {/* Desktop: Full breadcrumb */}
        <nav
          className="hidden sm:flex items-center gap-1.5 text-sm overflow-x-auto scrollbar-none"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="flex items-center gap-1 text-foreground-secondary hover:text-primary transition-colors flex-shrink-0"
          >
            <Home className="h-4 w-4" />
            <span>Inicio</span>
          </Link>

          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="h-4 w-4 text-foreground-muted flex-shrink-0" />
              {item.href && index < items.length - 1 ? (
                <Link
                  href={item.href}
                  className="text-foreground-secondary hover:text-primary transition-colors truncate max-w-[150px] lg:max-w-[200px]"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium truncate max-w-[150px] lg:max-w-[250px]">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
