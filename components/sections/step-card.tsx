"use client";

import { useState, ReactNode } from "react";
import { ChevronRight, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  extraText: ReactNode;
  icon: LucideIcon;
  colors: {
    numberBg: string;
    iconBg: string;
    iconColor: string;
  };
}

export function StepCard({
  number,
  title,
  description,
  extraText,
  icon: Icon,
  colors,
}: StepCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="shadow-sm transition-all duration-300 hover:shadow-md border-border h-[110px] overflow-hidden flex items-center">
        <CardContent className="flex items-center justify-between gap-3 w-full">
          {/* Lado Izquierdo */}
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-white text-sm ${colors.numberBg}`}
              >
                {number}
              </div>
              <h3 className="text-base font-bold tracking-tight text-foreground truncate">
                {title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${colors.iconBg} ${colors.iconColor}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-tight line-clamp-2">
                {description}
              </p>
            </div>
          </div>

          {/* Lado Derecho */}
          <div className="flex items-center pl-1 shrink-0 gap-2">
            {/* Contenido Extra con Animaciones de Apertura y Cierre */}
            <CollapsibleContent
              className="overflow-hidden transition-all duration-300 ease-in-out
                         data-[state=open]:animate-in data-[state=closed]:animate-out
                         data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                         data-[state=closed]:slide-out-to-right-2 data-[state=open]:slide-in-from-right-2"
            >
              <div className="flex items-center gap-3">
                <Separator
                  orientation="vertical"
                  className="w-[1.5px] bg-foreground/80"
                />
                <CollapsibleTrigger asChild>
                  <div className="max-w-[120px] text-[11px] font-medium leading-snug text-foreground cursor-pointer">
                    {extraText}
                  </div>
                </CollapsibleTrigger>
              </div>
            </CollapsibleContent>

            {/* Botón Trigger con Flecha que Rota Suavemente */}
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="p-1.5 text-foreground transition-transform duration-300 ease-in-out hover:opacity-80 focus:outline-none"
                aria-label="Ver detalles"
              >
                <ChevronRight
                  className={`h-5 w-5 stroke-[2.5] transition-transform duration-300 ${
                    isOpen ? "rotate-90" : "rotate-0"
                  }`}
                />
              </button>
            </CollapsibleTrigger>
          </div>
        </CardContent>
      </Card>
    </Collapsible>
  );
}
