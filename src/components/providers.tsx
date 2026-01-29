"use client";

import { type ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      <ToastProvider>{children}</ToastProvider>
    </NextThemesProvider>
  );
}
