"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  ArrowRight,
  Building2,
  Landmark,
  MapPin,
  EyeOff,
  Users,
  Phone,
  Lock,
  User,
  Mail,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Country, State, City } from "country-state-city";

import { VerifyEmailDialog } from "@/components/auth/verify-email-dialog";
import { LocationSelect } from "@/components/forms/location-select";
import { MascotCallout } from "@/components/shared/mascot-callout";
import { FormField } from "@/components/forms/form-field";
import type { RegisterFormState } from "@/types";
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

const INPUT_FIELDS = [
  {
    id: "firstName",
    placeholder: "Nombre",
    icon: User,
    type: "text",
    autoComplete: "given-name",
  },
  {
    id: "lastName",
    placeholder: "Apellido",
    icon: Users,
    type: "text",
    autoComplete: "family-name",
  },
  {
    id: "abi",
    placeholder: "ABI",
    icon: GraduationCap,
    type: "text",
    autoComplete: "off",
  },
  {
    id: "email",
    placeholder: "Correo electrónico",
    icon: Mail,
    type: "email",
    autoComplete: "email",
  },
  {
    id: "password",
    placeholder: "Contraseña",
    icon: Lock,
    type: "password",
    autoComplete: "new-password",
  },
  {
    id: "whatsapp",
    placeholder: "WhatsApp",
    icon: Phone,
    type: "tel",
    autoComplete: "tel",
  },
] as const;

const supabase = createClient();

export default function RegisterForm() {
  const [state, setState] = useState<RegisterFormState>({
    firstName: "",
    lastName: "",
    abi: "",
    email: "",
    password: "",
    showPassword: false,
    whatsapp: "",
    countryCode: "",
    stateCode: "",
    city: "",
    loading: false,
    showVerifyDialog: false,
  });
  const handleChange = (field: keyof RegisterFormState, value: string) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };
  const countries = useMemo(
    () =>
      Country.getAllCountries().map((c) => ({ code: c.isoCode, name: c.name })),
    [],
  );
  const states = useMemo(() => {
    if (!state.countryCode) return [];
    return (State.getStatesOfCountry(state.countryCode) || []).map((s) => ({
      code: s.isoCode,
      name: s.name,
    }));
  }, [state.countryCode]);
  const cities = useMemo(() => {
    if (!state.countryCode || !state.stateCode) return [];
    const raw = City.getCitiesOfState(state.countryCode, state.stateCode) || [];
    const unique = Array.from(new Map(raw.map((c) => [c.name, c])).values());
    return unique.map((c) => ({ code: c.name, name: c.name }));
  }, [state.countryCode, state.stateCode]);
  const handleRegister = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!state.countryCode || !state.stateCode || !state.city) {
      toast.error("Por favor completa el país, departamento y ciudad.");
      return;
    }
    if (!state.password || state.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const countryObj = countries.find((c) => c.code === state.countryCode);
    const stateObj = states.find((s) => s.code === state.stateCode);
    setState((prev) => ({ ...prev, loading: true }));
    toast.promise(
      (async () => {
        const origin = window.location.origin;
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: state.email,
            password: state.password,
            options: {
              emailRedirectTo: `${origin}/welcome`,
              data: {
                first_name: state.firstName,
                last_name: state.lastName,
                abi: state.abi,
                whatsapp: state.whatsapp,
                country: countryObj?.name || "",
                state: stateObj?.name || "",
                city: state.city,
              },
            },
          },
        );
        if (authError || !authData.user)
          throw new Error(authError?.message || "Error al crear la cuenta.");
        setState((prev) => ({ ...prev, showVerifyDialog: true }));
        return authData.user;
      })(),
      {
        loading: "Creando tu cuenta...",
        success: "¡Registro completado!",
        error: (err) =>
          err instanceof Error ? err.message : "Error en el registro",
        finally: () => setState((prev) => ({ ...prev, loading: false })),
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
            imageSrc="/mascot/otto-stand-white.png"
            orientation="vertical"
            message={
              <>
                Completa tus <span className="block">datos para</span>{" "}
                <span className="text-red-600 block">entrar al juego.</span>
              </>
            }
          />
        </div>
      </div>
      <Card className="w-full max-w-3xl !p-4 sm:!p-8 bg-white rounded-xl shadow-xl gap-4 sm:gap-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            Regístrate para comenzar a jugar
          </CardTitle>
          <CardDescription className="text-base sm:text-md text-slate-600">
            Completa tus datos y únete a{" "}
            <span className="font-bold text-red-600">
              &ldquo;Einigkeit&rdquo;
            </span>{" "}
            2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-8">
          <form
            id="register-form"
            onSubmit={handleRegister}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {INPUT_FIELDS.map((field) => {
              const isPassword = field.id === "password";
              return (
                <FormField
                  key={field.id}
                  {...field}
                  type={
                    isPassword
                      ? state.showPassword
                        ? "text"
                        : "password"
                      : field.type
                  }
                  value={
                    (state[field.id as keyof RegisterFormState] as string) || ""
                  }
                  onChange={(e) =>
                    handleChange(
                      field.id as keyof RegisterFormState,
                      e.target.value,
                    )
                  }
                  rightAction={
                    isPassword ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            showPassword: !prev.showPassword,
                          }))
                        }
                        className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-transparent"
                      >
                        {state.showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    ) : undefined
                  }
                />
              );
            })}
            <LocationSelect
              id="country"
              placeholder="Selecciona tu país"
              icon={MapPin}
              autoComplete="country-name"
              value={state.countryCode}
              onChange={(val) =>
                setState((prev) => ({
                  ...prev,
                  countryCode: val,
                  stateCode: "",
                  city: "",
                }))
              }
              options={countries}
            />
            <LocationSelect
              id="state"
              placeholder={
                !state.countryCode
                  ? "Elige país primero"
                  : "Departamento / Estado"
              }
              icon={Landmark}
              autoComplete="address-level1"
              value={state.stateCode}
              disabled={!state.countryCode || states.length === 0}
              onChange={(val) =>
                setState((prev) => ({ ...prev, stateCode: val, city: "" }))
              }
              options={states}
            />
            <LocationSelect
              id="city"
              placeholder={
                !state.stateCode
                  ? "Elige departamento primero"
                  : "Selecciona tu ciudad"
              }
              icon={Building2}
              autoComplete="address-level2"
              value={state.city}
              disabled={!state.stateCode || cities.length === 0}
              onChange={(val) => handleChange("city", val)}
              options={cities}
            />
          </form>
        </CardContent>
        <CardFooter className="px-4 sm:px-8 py-0 justify-items-center grid gap-3 border-none">
          <Button
            form="register-form"
            type="submit"
            disabled={state.loading}
            className="relative w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-xl rounded-xl transition duration-300 group"
          >
            {state.loading ? "Registrando..." : "Comenzar a jugar"}
            {!state.loading && (
              <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
            )}
          </Button>
        </CardFooter>
      </Card>

      <VerifyEmailDialog
        open={state.showVerifyDialog}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, showVerifyDialog: open }))
        }
        email={state.email}
      />
    </>
  );
}
