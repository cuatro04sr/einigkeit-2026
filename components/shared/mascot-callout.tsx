import { MascotCalloutProps } from "@/types";

import Image from "next/image";

export function MascotCallout({
  imageSrc,
  message,
  orientation = "horizontal",
  className = "",
}: MascotCalloutProps) {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      className={`relative flex transition-all duration-300 ${
        isHorizontal
          ? "flex-row items-start justify-end w-full max-w-[380px] md:max-w-[480px] lg:max-w-[580px] xl:max-w-[620px]"
          : "flex-col items-center w-full max-w-[240px] md:max-w-[300px] lg:max-w-[340px] xl:max-w-[380px]"
      } ${className}`}
    >
      <div
        className={`relative z-10 bg-white text-slate-900 font-bold border border-slate-100/50 drop-shadow-xl ${
          isHorizontal
            ? "p-3 sm:p-4 lg:p-5 rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] w-[170px] sm:w-[190px] md:w-[210px] lg:w-[230px] shrink-0 mt-1 sm:mt-2 -mr-4 sm:-mr-6 lg:-mr-8"
            : "p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] w-fit text-center -mb-2 sm:-mb-3"
        }`}
      >
        <p
          className={`font-bold leading-tight text-slate-900 tracking-tight ${isHorizontal ? "text-xs sm:text-sm lg:text-base" : "text-xs sm:text-sm"}`}
        >
          {message}
        </p>
        <div
          className={
            isHorizontal
              ? "absolute bottom-4 sm:bottom-5 -right-[14px] sm:-right-[18px] w-0 h-0 border-t-[8px] sm:border-t-[10px] border-t-transparent border-b-[14px] sm:border-b-[18px] border-b-transparent border-l-[16px] sm:border-l-[20px] border-l-white"
              : "absolute -bottom-[10px] sm:-bottom-[14px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] sm:border-l-[10px] border-l-transparent border-r-[8px] sm:border-r-[10px] border-r-transparent border-t-[10px] sm:border-t-[14px] border-t-white"
          }
        />
      </div>
      <div
        className={`relative z-0 shrink-0 ${
          isHorizontal
            ? "w-[200px] sm:w-[260px] md:w-[320px] lg:w-[380px] xl:w-[440px] h-[260px] sm:h-[320px] md:h-[400px] lg:h-[480px] xl:h-[520px]"
            : "w-[150px] sm:w-[190px] md:w-[230px] lg:w-[280px] xl:w-[320px] h-[200px] sm:h-[240px] md:h-[290px] lg:h-[350px] xl:h-[400px]"
        }`}
      >
        <Image
          src={imageSrc}
          alt="Mascota ASODECA"
          fill
          className="object-contain object-bottom"
          priority
        />
      </div>
    </div>
  );
}
