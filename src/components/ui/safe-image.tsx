"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackClassName?: string;
  iconSize?: "sm" | "md" | "lg";
}

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-12 w-12",
};

export function SafeImage({
  fallbackClassName,
  iconSize = "md",
  className,
  alt,
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-secondary",
          fallbackClassName
        )}
      >
        <ImageOff className={cn("text-foreground-muted", iconSizes[iconSize])} />
      </div>
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
