"use client";

import { StepCardsGrid } from "@/components/landing/step-cards-grid";
import { MascotCallout } from "@/components/shared/mascot-callout";
import { Button } from "@/components/ui/button";
import { HERO_CARDS_STEPS } from "@/constants";

import { ArrowRight, Scale } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden
                 bg-cover bg-center bg-no-repeat
                 bg-[url('/bg-mobile.png')]
                 lg:bg-[url('/backgrounds/hero/bg-desktop.png')]"
    >
      <div className="hidden lg:flex absolute top-0 right-10 h-full pointer-events-none z-0 items-center justify-end w-1/2">
        <div className="pointer-events-auto">
          <MascotCallout
            imageSrc="/mascot/otto-hero.png"
            orientation="horizontal"
            message={
              <>
                Hola soy Otto y ASODECA me adoptó para{" "}
                <span className="text-red-600">
                  acompañarte en cada misión.
                </span>
              </>
            }
          />
        </div>
      </div>
      <div className="relative z-10 w-full px-4 py-4 md:px-6 lg:px-12 flex flex-col gap-2 lg:gap-4">
        <header className="w-full lg:w-1/2 max-w-2xl lg:max-w-none flex flex-col items-start gap-4 text-left">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-none">
            JUEGO <br />
            INTERACTIVO <br />
            <span className="text-red-500">EINIGKEIT 2026</span>
          </h1>
          <div className="text-md font-semibold leading-tight space-y-4">
            <p className="pt-1">ASODECA: De egresados para egresados.</p>
            <p>
              Prepárate para{" "}
              <span className="font-semibold text-red-500">
                &ldquo;Einigkeit&rdquo; 2026.
              </span>{" "}
              Vivirás 8 misiones semanales para reconectar con tu historia y
              derribar el muro del reencuentro.
            </p>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400 text-black">
              <Scale className="h-6 w-6 stroke-[2.25]" />
            </div>
            <div>
              <h2 className="text-md font-semibold tracking-tight text-foreground">
                Reglas del juego
              </h2>
              <p className="text-sm text-slate-600">
                Haz click en una tarjeta para ver el detalle.
              </p>
            </div>
          </div>
        </header>
        <div className="my-2 flex flex-col lg:flex-row items-center lg:items-end gap-4 lg:gap-6 w-full">
          <StepCardsGrid steps={HERO_CARDS_STEPS} className="flex-1" />
          <div className="shrink-0 flex items-center justify-center w-full lg:w-auto">
            <Button
              asChild
              size="lg"
              className="group flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-6 rounded-xl shadow-md transition-all hover:shadow-lg w-full lg:w-auto min-h-[52px]"
            >
              <Link href="/login">
                <span className="whitespace-nowrap text-base">
                  Comenzar a jugar
                </span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
