import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const getPageUrl = (page: number) => {
    if (page === 1) return baseUrl;
    return `${baseUrl}?page=${page}`;
  };

  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (showEllipsisStart) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (showEllipsisEnd) {
        pages.push("ellipsis");
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav className="flex items-center justify-center gap-0.5 sm:gap-1" aria-label="Paginación">
      {/* Previous */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 sm:h-11 sm:w-11"
        asChild={currentPage > 1}
        disabled={currentPage <= 1}
        aria-label="Página anterior"
      >
        {currentPage > 1 ? (
          <Link href={getPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-5 w-5" />
          </span>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 sm:px-2 text-foreground-muted text-sm"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              className="h-10 w-10 sm:h-11 sm:w-11 text-sm"
              asChild={page !== currentPage}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page === currentPage ? (
                <span>{page}</span>
              ) : (
                <Link href={getPageUrl(page)}>{page}</Link>
              )}
            </Button>
          )
        )}
      </div>

      {/* Next */}
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 sm:h-11 sm:w-11"
        asChild={currentPage < totalPages}
        disabled={currentPage >= totalPages}
        aria-label="Página siguiente"
      >
        {currentPage < totalPages ? (
          <Link href={getPageUrl(currentPage + 1)}>
            <ChevronRight className="h-5 w-5" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-5 w-5" />
          </span>
        )}
      </Button>
    </nav>
  );
}
