"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    // Add transition class for smooth theme change
    document.documentElement.classList.add("transitioning");
    setTimeout(() => {
      document.documentElement.classList.remove("transitioning");
    }, 300);

    // Cycle: system -> light -> dark -> system
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Sun className="h-5 w-5" />
        <span className="sr-only">Cambiar tema</span>
      </Button>
    );
  }

  const getIcon = () => {
    if (theme === "light") {
      return <Sun className="h-5 w-5" />;
    }
    if (theme === "dark") {
      return <Moon className="h-5 w-5" />;
    }
    // system
    return <Monitor className="h-5 w-5" />;
  };

  const getLabel = () => {
    if (theme === "light") return "Modo claro";
    if (theme === "dark") return "Modo oscuro";
    return "Automático";
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={getLabel()}
      className={cn(
        "relative transition-transform duration-200 hover:scale-105"
      )}
    >
      <div className="transition-transform duration-300">
        {getIcon()}
      </div>
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
}
