import Image from "next/image";

interface MascotCalloutVerticalProps {
  imageSrc?: string;
  className?: string;
}

export function MascotCalloutVertical({
  imageSrc = "/otto-rabbit.png",
  className = "",
}: MascotCalloutVerticalProps) {
  return (
    <div
      className={`relative flex flex-col items-center w-full max-w-[240px] md:max-w-[300px] lg:max-w-[340px] xl:max-w-[380px] transition-all duration-300 ${className}`}
    >
      {/* 1. Globo de Diálogo (Arriba) */}
      <div className="relative z-10 bg-white text-slate-900 font-bold p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] border border-slate-100/50 w-fit text-center -mb-2 sm:-mb-3 drop-shadow-xl">
        <p className="text-xs sm:text-sm font-bold leading-tight text-slate-900 tracking-tight">
          Si ya tienes
          <span className="block">cuenta,</span>{" "}
          <span className="text-red-600 block">continua por</span>
          <span className="text-red-600 block">aqui</span>
        </p>

        {/* Colita apuntando hacia abajo */}
        <div
          className="absolute -bottom-[10px] sm:-bottom-[14px] left-1/2 -translate-x-1/2 w-0 h-0 
                     border-l-[8px] sm:border-l-[10px] border-l-transparent 
                     border-r-[8px] sm:border-r-[10px] border-r-transparent 
                     border-t-[10px] sm:border-t-[14px] border-t-white"
        />
      </div>

      {/* 2. Imagen de Otto */}
      {/* Se han reducido los anchos (w-*) y altos (h-*) de la imagen */}
      <div className="relative z-0 w-[150px] sm:w-[190px] md:w-[230px] lg:w-[280px] xl:w-[320px] h-[200px] sm:h-[240px] md:h-[290px] lg:h-[350px] xl:h-[400px] shrink-0">
        <Image
          src={imageSrc}
          alt="Otto el Conejo - ASODECA"
          fill
          className="object-contain object-bottom"
          priority
        />
      </div>
    </div>
  );
}
