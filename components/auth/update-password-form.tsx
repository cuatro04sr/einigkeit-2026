"use client";

import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
    loading: false,
  });
  const handleUpdatePassword = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.password || form.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setForm((prev) => ({ ...prev, loading: true }));
    toast.promise(
      (async () => {
        const { error } = await supabase.auth.updateUser({
          password: form.password,
        });
        if (error) {
          throw new Error(
            error.message || "Error al actualizar la contraseña.",
          );
        }
        router.push("/login");
        return true;
      })(),
      {
        loading: "Actualizando contraseña...",
        success: "¡Contraseña actualizada con éxito! Redirigiendo...",
        error: (err) =>
          err instanceof Error
            ? err.message
            : "Error al actualizar la contraseña",
        finally: () => setForm((prev) => ({ ...prev, loading: false })),
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
                ¡Casi listo!{" "}
                <span className="text-red-600 block">Crea tu nueva clave</span>
              </>
            }
          />
        </div>
      </div>
      <Card className="w-full max-w-2xl !p-4 sm:!p-8 bg-white rounded-xl shadow-xl gap-4 sm:gap-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            Nueva contraseña
          </CardTitle>
          <CardDescription className="text-base sm:text-md text-slate-600">
            Define tu nueva clave para asegurar tu cuenta en{" "}
            <span className="font-bold text-red-600">
              &ldquo;Einigkeit&rdquo;
            </span>{" "}
            2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-12">
          <form
            id="update-form"
            onSubmit={handleUpdatePassword}
            className="grid gap-4"
          >
            {/* Campo 1: Nueva Contraseña */}
            <FormField
              id="password"
              placeholder="Nueva contraseña"
              icon={Lock}
              type={form.showPassword ? "text" : "password"}
              autoComplete="new-password"
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
            <FormField
              id="confirmPassword"
              placeholder="Confirmar nueva contraseña"
              icon={Lock}
              type={form.showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              rightAction={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      showConfirmPassword: !prev.showConfirmPassword,
                    }))
                  }
                  className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-transparent"
                >
                  {form.showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              }
            />
          </form>
        </CardContent>
        <CardFooter className="px-4 sm:px-12 py-0 justify-items-center grid gap-3 border-none">
          <Button
            form="update-form"
            type="submit"
            disabled={form.loading}
            className="relative w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-xl transition duration-300 group"
          >
            {form.loading ? "Guardando..." : "Guardar nueva contraseña"}
            {!form.loading && (
              <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
            )}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
