import Image from "next/image";

interface MascotCalloutProps {
  imageSrc?: string;
}

export function MascotCallout({
  imageSrc = "/otto-rabbit.png",
}: MascotCalloutProps) {
  return (
    <div className="relative flex flex-row items-start justify-end w-full max-w-[380px] md:max-w-[480px] lg:max-w-[580px] xl:max-w-[620px] transition-all duration-300">
      {/* 1. Globo de Diálogo (Escala su ancho, padding y texto según la pantalla) */}
      <div className="relative z-10 bg-white text-slate-900 font-bold p-3 sm:p-4 lg:p-5 rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] border border-slate-100/50 w-[170px] sm:w-[190px] md:w-[210px] lg:w-[230px] shrink-0 mt-1 sm:mt-2 -mr-4 sm:-mr-6 lg:-mr-8 drop-shadow-xl">
        <p className="text-xs sm:text-sm lg:text-base font-bold leading-tight text-slate-900 tracking-tight">
          Hola soy Otto y ASODECA me adoptó{" "}
          <span className="text-red-600 block">para</span>
          <span className="text-red-600 block">acompañarte en</span>
          <span className="text-red-600 block">cada misión</span>
        </p>

        {/* Colita adaptativa */}
        <div
          className="absolute bottom-4 sm:bottom-5 -right-[14px] sm:-right-[18px] w-0 h-0 
                     border-t-[8px] sm:border-t-[10px] border-t-transparent 
                     border-b-[14px] sm:border-b-[18px] border-b-transparent 
                     border-l-[16px] sm:border-l-[20px] border-l-white"
        />
      </div>

      {/* 2. Imagen de Otto (Escala su tamaño según la pantalla) */}
      <div className="relative z-0 w-[200px] sm:w-[260px] md:w-[320px] lg:w-[380px] xl:w-[440px] h-[260px] sm:h-[320px] md:h-[400px] lg:h-[480px] xl:h-[520px] shrink-0">
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
