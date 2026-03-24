"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-normal capitalize",
        nav: "flex items-center gap-1",
        button_previous:
          "absolute left-1 top-0 inline-flex items-center justify-center rounded-md h-7 w-7 bg-transparent hover:bg-secondary text-foreground-secondary hover:text-foreground transition-colors",
        button_next:
          "absolute right-1 top-0 inline-flex items-center justify-center rounded-md h-7 w-7 bg-transparent hover:bg-secondary text-foreground-secondary hover:text-foreground transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-foreground-muted rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative",
        day_button:
          "h-9 w-9 rounded-md font-normal hover:bg-secondary hover:text-foreground transition-colors cursor-pointer inline-flex items-center justify-center",
        selected:
          "[&>.day_button]:bg-primary [&>.day_button]:text-white [&>.day_button]:hover:bg-primary/90 [&>.day_button]:font-medium",
        today: "[&>.day_button]:bg-secondary [&>.day_button]:font-medium",
        outside:
          "text-foreground-muted/50 [&>.day_button]:hover:bg-secondary/50",
        disabled:
          "text-foreground-muted/30 [&>.day_button]:cursor-not-allowed [&>.day_button]:hover:bg-transparent",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
