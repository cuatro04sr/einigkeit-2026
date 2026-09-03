"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/lib/client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AcceptInvitePage() {
  const params = useParams();
  const inviteCode = params?.code as string;
  const { user } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();
  const [processing, setProcessing] = useState(true);
  useEffect(() => {
    async function processInvitation() {
      if (!inviteCode) return;
      if (!user) {
        localStorage.setItem("pending_invite_code", inviteCode);
        toast.info("Inicia sesión para aceptar la invitación y sumar puntos.");
        router.push(`/login?redirect=/invita/${inviteCode}`);
        return;
      }
      try {
        localStorage.removeItem("pending_invite_code");
        const { data: hostData, error: hostError } = await supabase
          .from("user_responses")
          .select("user_id")
          .eq("selected_option", inviteCode)
          .single();
        if (hostError || !hostData) {
          toast.error("El enlace de invitación no es válido o ya expiró.");
          router.push("/");
          return;
        }
        const hostUserId = hostData.user_id;
        if (hostUserId === user.id) {
          toast.warning("No puedes aceptar tu propia invitación.");
          router.push("/");
          return;
        }
        const { error: inviteError } = await supabase
          .from("invitations")
          .insert([
            { host_id: hostUserId, guest_id: user.id, code: inviteCode },
          ]);
        if (inviteError) {
          if (inviteError.code === "23505") {
            toast.info("Ya habías aceptado esta invitación anteriormente.");
          } else {
            throw inviteError;
          }
        } else {
          toast.success(
            "¡Invitación aceptada con éxito! Se han sumado puntos al muro.",
          );
        }
      } catch (err) {
        console.error("Error procesando invitación:", err);
      } finally {
        setProcessing(false);
        router.push("/");
      }
    }
    processInvitation();
  }, [inviteCode, user, router, supabase]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-lg font-medium text-slate-700">
        {processing ? "Procesando invitación..." : "Redirigiendo..."}
      </p>
    </div>
  );
}
