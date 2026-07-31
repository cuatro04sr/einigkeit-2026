"use client";

import { useState } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    abi: "",
    whatsapp: "",
    city: "",
    country: "Colombia",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          abi: formData.abi,
          whatsapp: formData.whatsapp,
          city: formData.city,
          country: formData.country,
        },
      },
    });

    setLoading(false);

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    alert("¡Cuenta creada exitosamente!");
    router.push("/login");
  };

  return (
    <form
      onSubmit={handleRegister}
      className="flex flex-col gap-3 max-w-md mx-auto p-6 bg-slate-900 text-white rounded-xl"
    >
      <h2 className="text-xl font-bold text-center">Registro de Jugador</h2>

      <input
        name="firstName"
        placeholder="Nombre"
        onChange={handleChange}
        required
        className="p-2 bg-slate-800 rounded border border-slate-700"
      />
      <input
        name="lastName"
        placeholder="Apellido"
        onChange={handleChange}
        required
        className="p-2 bg-slate-800 rounded border border-slate-700"
      />
      <input
        name="abi"
        placeholder="ABI"
        onChange={handleChange}
        required
        className="p-2 bg-slate-800 rounded border border-slate-700"
      />
      <input
        name="whatsapp"
        placeholder="WhatsApp"
        onChange={handleChange}
        required
        className="p-2 bg-slate-800 rounded border border-slate-700"
      />
      <input
        name="city"
        placeholder="Ciudad"
        onChange={handleChange}
        required
        className="p-2 bg-slate-800 rounded border border-slate-700"
      />
      <input
        name="country"
        defaultValue="Colombia"
        onChange={handleChange}
        required
        className="p-2 bg-slate-800 rounded border border-slate-700"
      />
      <input
        name="email"
        type="email"
        placeholder="Correo electrónico"
        onChange={handleChange}
        required
        className="p-2 bg-slate-800 rounded border border-slate-700"
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        onChange={handleChange}
        required
        className="p-2 bg-slate-800 rounded border border-slate-700"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-red-600 hover:bg-red-700 font-bold p-3 rounded-lg mt-2"
      >
        {loading ? "Registrando..." : "Crear Cuenta"}
      </button>
    </form>
  );
}
