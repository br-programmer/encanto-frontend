"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopBanner() {
  const pathname = usePathname();

  if (pathname === "/flores-en-24-hrs") return null;

  return (
    <Link
      href="/flores-en-24-hrs"
      className="block bg-primary text-white text-center py-2 text-xs sm:text-sm font-normal tracking-wide hover:bg-primary-hover transition-colors"
    >
      FLORES EN MANTA EN 24 HRS 💐
    </Link>
  );
}
