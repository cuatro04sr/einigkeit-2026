"use client";

import { StepCard } from "@/components/landing/step-card";
import { StepCardsGridProps } from "@/types";

export function StepCardsGrid({ steps, className = "" }: StepCardsGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full ${className}`}
    >
      {steps.map((step) => (
        <StepCard
          key={step.id}
          number={step.id}
          title={step.title}
          description={step.desc}
          extraText={step.extra}
          icon={step.icon}
          colors={step.color}
        />
      ))}
    </div>
  );
}
