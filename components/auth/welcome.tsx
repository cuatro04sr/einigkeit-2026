"use client";

import { MascotCallout } from "@/components/shared/mascot-callout";
import { Button } from "@/components/ui/button";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Welcome() {
  return (
    <>
      <div
        className="absolute inset-0 -z-10 pointer-events-none
                 bg-cover bg-center bg-no-repeat
                 bg-[url('/bg-mobile.png')]
                 lg:bg-[size:100%_100%] lg:bg-center
                 lg:bg-[url('/backgrounds/auth/welcome-desktop.png')]"
      />
      <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        <div className="flex-1 flex flex-col items-center text-center space-y-6 w-full z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
            ¡Bienvenido <span className="text-red-600 block">al juego!</span>
          </h1>
          <p className="font-semibold text-xl sm:text-2xl tracking-tight leading-tight max-w-md">
            Tu Abi ya quedó <span className="block">registrado.</span>{" "}
            <span className="text-blue-600">La Misión 1</span> te espera.
          </p>
          <div className="w-full pt-2">
            <Link href="/">
              <Button className="relative w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl transition duration-300 group">
                Comenzar juego
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center w-full">
          <MascotCallout
            imageSrc="/mascot/otto-welcome.png"
            orientation="vertical"
            message={
              <>
                Haz clic <br />
                para <span className="text-red-600">empezar</span>
              </>
            }
          />
        </div>
      </div>
    </>
  );
}
