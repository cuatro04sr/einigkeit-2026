import { Scale } from "lucide-react";
import { StepCardsGrid } from "./step-cards-grid";
import { MascotCallout } from "./mascot-callout";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* 1. Mascot Callout: Pegado a la derecha en PC */}
      <div className="hidden lg:flex absolute top-0 right-0 h-full pointer-events-none z-0 items-center justify-end w-1/2">
        <div className="pointer-events-auto">
          <MascotCallout imageSrc="/otto-rabbit.png" />
        </div>
      </div>

      {/* 2. Contenido Principal Fluido */}
      <div className="relative z-10 w-full px-4 md:px-6 lg:px-12 flex flex-col gap-2 lg:gap-4">
        {/* Encabezado */}
        <div className="w-full lg:w-1/2 max-w-2xl lg:max-w-none gap-2 flex flex-col items-start text-left">
          {/* Título Principal */}
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-none">
            JUEGO <br />
            INTERACTIVO <br />
            <span className="text-red-500">EINIGKEIT 2026</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-md font-medium pt-1">
            ASODECA: De egresados para egresados.
          </p>

          {/* Descripción */}
          <p className="text-md font-medium leading-tight">
            Prepárate para{" "}
            <span className="font-semibold text-red-500">
              &ldquo;Einigkeit&rdquo; 2026.
            </span>{" "}
            Vivirás 8 misiones semanales para reconectar con tu historia y
            derribar el muro del reencuentro.
          </p>

          <div className="flex items-center gap-4 pt-2">
            {/* Círculo amarillo con el icono */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400 text-black">
              <Scale className="h-6 w-6 stroke-[2.25]" />
            </div>

            {/* Textos de reglas */}
            <div className="flex flex-col">
              <h2 className="text-md font-semibold tracking-tight text-foreground">
                Reglas del juego
              </h2>
              <p className="text-sm text-slate-600">
                Haz click en una tarjeta para ver el detalle.
              </p>
            </div>
          </div>
        </div>

        {/* Grilla de tarjetas pegada directamente abajo */}
        <div className="w-full">
          <StepCardsGrid />
        </div>
      </div>
    </section>
  );
}
