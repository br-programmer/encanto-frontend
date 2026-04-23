"use client";

import { Check, User, MapPin, CalendarDays, CreditCard, ClipboardList, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDef {
  label: string;
  icon: typeof User;
}

const STEPS_GUEST: StepDef[] = [
  { label: "Tus datos", icon: User },
  { label: "Entrega", icon: MapPin },
  { label: "Fecha y detalles", icon: CalendarDays },
  { label: "Facturación", icon: FileText },
  { label: "Pago", icon: CreditCard },
  { label: "Resumen", icon: ClipboardList },
];

const STEPS_AUTH: StepDef[] = [
  { label: "Entrega", icon: MapPin },
  { label: "Fecha y detalles", icon: CalendarDays },
  { label: "Facturación", icon: FileText },
  { label: "Pago", icon: CreditCard },
  { label: "Resumen", icon: ClipboardList },
];

interface CheckoutProgressProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
  isGuest: boolean;
}

export function CheckoutProgress({ currentStep, completedSteps, onStepClick, isGuest }: CheckoutProgressProps) {
  const steps = isGuest ? STEPS_GUEST : STEPS_AUTH;

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex items-center justify-center gap-0 mb-8">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isCompleted = completedSteps.includes(stepNum);
          const isCurrent = currentStep === stepNum;
          const isClickable = isCompleted || stepNum < currentStep;

          return (
            <div key={stepNum} className="flex items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(stepNum)}
                disabled={!isClickable}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full transition-colors text-sm",
                  isCurrent && "bg-primary text-white",
                  isCompleted && !isCurrent && "text-primary cursor-pointer hover:bg-primary/5",
                  !isCompleted && !isCurrent && "text-foreground-muted cursor-default"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0",
                  isCurrent && "bg-white/20",
                  isCompleted && !isCurrent && "bg-primary/10",
                  !isCompleted && !isCurrent && "bg-secondary"
                )}>
                  {isCompleted && !isCurrent ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span className="font-normal">{step.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={cn(
                  "w-8 lg:w-12 h-px mx-1",
                  completedSteps.includes(stepNum) ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="sm:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-normal">
            Paso {currentStep} de {steps.length}
          </p>
          <p className="text-sm text-foreground-secondary">
            {steps[currentStep - 1]?.label}
          </p>
        </div>
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i + 1 <= currentStep ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function getTotalSteps(isGuest: boolean): number {
  return isGuest ? STEPS_GUEST.length : STEPS_AUTH.length;
}
