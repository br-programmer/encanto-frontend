"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  questions: Question[];
}

export function FaqAccordion({ questions }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {questions.map((item, index) => (
        <div
          key={index}
          className="border border-border rounded-lg overflow-hidden bg-background"
        >
          <button
            onClick={() => toggleQuestion(index)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
            aria-expanded={openIndex === index}
          >
            <span className="font-normal pr-4">{item.question}</span>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 text-foreground-muted transition-transform duration-200",
                openIndex === index && "rotate-180"
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-200 ease-in-out",
              openIndex === index ? "max-h-96" : "max-h-0"
            )}
          >
            <div className="p-4 pt-0 text-foreground-secondary leading-relaxed">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
