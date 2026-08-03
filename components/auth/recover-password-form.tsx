"use client";

import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

import { MascotCallout } from "@/components/shared/mascot-callout";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import {
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Card,
} from "@/components/ui/card";

export default function RecoverPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const handleResetPassword = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico.");
      return;
    }
    setLoading(true);
    toast.promise(
      (async () => {
        const origin = window.location.origin;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/update-password`,
        });
        if (error) {
          throw new Error(
            error.message || "Error al enviar el correo de recuperación.",
          );
        }
        setEmailSent(true);
        return true;
      })(),
      {
        loading: "Enviando correo...",
        success: "¡Instrucciones enviadas! Revisa tu bandeja de entrada.",
        error: (err) =>
          err instanceof Error ? err.message : "Error al procesar la solicitud",
        finally: () => setLoading(false),
        position: "top-center",
      },
    );
  };
  return (
    <>
      <div className="hidden lg:flex h-full absolute top-0 right-0 z-0 pointer-events-none items-center justify-end">
        <div className="pointer-events-auto">
          <MascotCallout
            imageSrc="/otto-rabbit-2.png"
            orientation="vertical"
            message={
              <>
                ¿Olvidaste tu clave?{" "}
                <span className="text-red-600 block">Te ayudamos a volver</span>
              </>
            }
          />
        </div>
      </div>
      <Card className="w-full max-w-2xl !p-4 sm:!p-8 bg-white rounded-xl shadow-xl gap-4 sm:gap-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            Recupera tu contraseña
          </CardTitle>
          <CardDescription className="text-base sm:text-md text-slate-600">
            Escribe tu correo y te enviaremos un enlace para restablecer tu
            acceso a{" "}
            <span className="font-bold text-red-600">
              &ldquo;Einigkeit&rdquo;
            </span>{" "}
            2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-12">
          {emailSent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <p className="text-slate-800 font-semibold text-base">
                ¡Correo enviado a <span className="text-red-600">{email}</span>!
              </p>
              <p className="text-sm text-slate-600">
                Abre el enlace que te enviamos para definir tu nueva contraseña.
              </p>
            </div>
          ) : (
            <form
              id="recover-form"
              onSubmit={handleResetPassword}
              className="grid gap-4"
            >
              <FormField
                id="email"
                placeholder="Correo electrónico registrado"
                icon={Mail}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </form>
          )}
        </CardContent>
        <CardFooter className="px-4 sm:px-12 py-0 justify-items-center grid gap-3 border-none">
          {!emailSent && (
            <Button
              form="recover-form"
              type="submit"
              disabled={loading}
              className="relative w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-xl transition duration-300 group"
            >
              {loading ? "Enviando..." : "Enviar enlace"}
              {!loading && (
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          )}
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-xs h-12 bg-white hover:bg-slate-50 text-slate-700 font-bold text-base rounded-xl border-slate-300 transition duration-300 gap-2 mt-2"
          >
            <Link href="/login">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
