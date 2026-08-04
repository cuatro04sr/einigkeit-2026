"use client";

import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
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

const supabase = createClient();

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    showPassword: false,
    loading: false,
  });
  const handleLogin = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForm((prev) => ({ ...prev, loading: true }));
    toast.promise(
      (async () => {
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password,
          });
        if (authError || !authData.user) {
          throw new Error(
            "Credenciales inválidas. Por favor intenta de nuevo.",
          );
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("app_role")
          .eq("id", authData.user.id)
          .single();
        router.push(profile?.app_role === "admin" ? "/admin" : "/");
      })(),
      {
        loading: "Iniciando sesión...",
        success: "¡Bienvenido de nuevo! Redirigiendo...",
        error: (err) =>
          err instanceof Error
            ? err.message
            : "Ocurrió un error al iniciar sesión",
        finally: () => setForm((prev) => ({ ...prev, loading: false })),
        position: "top-center",
      },
    );
  };

  return (
    <>
      <div
        className="absolute inset-0 -z-10 pointer-events-none
                 bg-cover bg-center bg-no-repeat
                 bg-[url('/bg-mobile.png')]
                 lg:bg-[size:100%_100%] lg:bg-center
                 lg:bg-[url('/backgrounds/auth/bg-desktop.png')]"
      />
      <div className="hidden lg:flex h-full absolute top-0 right-0 z-0 pointer-events-none items-center justify-end">
        <div className="pointer-events-auto">
          <MascotCallout
            imageSrc="/mascot/otto-stand-green.png"
            orientation="vertical"
            message={
              <>
                Si ya tienes cuenta,{" "}
                <span className="text-red-600 block">continúa por aquí</span>
              </>
            }
          />
        </div>
      </div>
      <Card className="w-full max-w-2xl !p-4 sm:!p-8 bg-white rounded-xl shadow-xl gap-4 sm:gap-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            Continúa tu misión
          </CardTitle>
          <CardDescription className="text-base sm:text-md text-slate-600">
            Usa tus datos para retomar tus misiones en{" "}
            <span className="font-bold text-red-600">
              &ldquo;Einigkeit&rdquo;
            </span>{" "}
            2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-12">
          <form id="login-form" onSubmit={handleLogin} className="grid gap-4">
            <FormField
              id="email"
              placeholder="Correo electrónico"
              icon={Mail}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <FormField
              id="password"
              placeholder="Contraseña"
              icon={Lock}
              type={form.showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              rightAction={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      showPassword: !prev.showPassword,
                    }))
                  }
                  className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-transparent"
                >
                  {form.showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              }
            />
            <Link
              href="/recover-password"
              className="text-slate-900 font-medium text-sm underline hover:text-slate-700 transition self-start"
            >
              Recuperar contraseña
            </Link>
          </form>
        </CardContent>
        <CardFooter className="px-4 sm:px-12 py-0 justify-items-center grid gap-3 border-none">
          <Button
            form="login-form"
            type="submit"
            disabled={form.loading}
            className="relative w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-xl transition duration-300 group"
          >
            {form.loading ? "Ingresando..." : "Comenzar a jugar"}
            {!form.loading && (
              <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
            )}
          </Button>
          <p className="text-md font-medium text-slate-700 mt-2">
            ¿Es tu primera vez?
          </p>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-xs h-12 bg-white hover:bg-slate-50 text-red-600 hover:text-red-700 font-bold text-base rounded-xl border-red-600 transition duration-300"
          >
            <Link href="/register">Crear mi cuenta</Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
