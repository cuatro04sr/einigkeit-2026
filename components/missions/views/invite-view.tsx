"use client";

import { MascotCallout } from "@/components/shared/mascot-callout";
import { InviteViewProps, UserResponsePayload } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { cn } from "@/lib/utils";

import { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  LayoutGrid,
  ArrowRight,
  ArrowLeft,
  Share2,
  Check,
  Copy,
  Gift,
  Star,
} from "lucide-react";
import { InviteDialog } from "../invite-dialog";

export function InviteView({ mission, questions }: InviteViewProps) {
  const { user } = useAuthStore();
  const supabase = useMemo(() => createClient(), []);
  const question = useMemo(
    () => (Array.isArray(questions) ? questions[0] : questions),
    [questions],
  );
  const [inviteCode, setInviteCode] = useState<string>("");
  const [existingResponse, setExistingResponse] =
    useState<UserResponsePayload | null>(null);
  const [loadingCode, setLoadingCode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [acceptedCount, setAcceptedCount] = useState<number>(0);
  const [showResultModal, setShowResultModal] = useState(false);
  useEffect(() => {
    async function fetchOrGenerateCode() {
      if (!user || !question) return;
      try {
        setLoadingCode(true);
        const { data: existingResponse, error: fetchError } = await supabase
          .from("user_responses")
          .select("*")
          .eq("user_id", user.id)
          .eq("question_id", question.id)
          .single();
        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error al buscar respuesta previa:", fetchError);
        }
        setExistingResponse(existingResponse);
        if (existingResponse && existingResponse.selected_option) {
          setInviteCode(existingResponse.selected_option);
          fetchAcceptedCount(user.id);
        } else {
          const generated = `TM${Math.floor(1000 + Math.random() * 9000)}`;
          const payload: UserResponsePayload = {
            user_id: user.id,
            mission_id: mission.id,
            question_id: question.id,
            selected_option: generated,
            is_correct: true,
            points_earned: 0,
          };
          const { error: insertError } = await supabase
            .from("user_responses")
            .upsert([payload], { onConflict: "user_id,question_id" });
          if (insertError) throw insertError;
          setInviteCode(generated);
          setAcceptedCount(0);
        }
      } catch (e) {
        console.error(e);
        toast.error("Error al gestionar el código de invitación");
      } finally {
        setLoadingCode(false);
      }
    }
    async function fetchAcceptedCount(userId: string) {
      const { count, error } = await supabase
        .from("invitations")
        .select("*", { count: "exact", head: true })
        .eq("host_id", userId);
      if (!error && count !== null) {
        setAcceptedCount(count);
      }
    }
    fetchOrGenerateCode();
  }, [user, question, mission.id, supabase]);
  const inviteLink = useMemo(() => {
    const code = inviteCode || "TM1995";
    return `einigkeit2026.asodeca.co/invita/${code}`;
  }, [inviteCode]);
  const handleCopyCode = useCallback(() => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(`https://${inviteLink}`);
    setCopied(true);
    toast.success("¡Enlace copiado al portapapeles!");
    setTimeout(() => setCopied(false), 3000);
    setShowResultModal(true);
  }, [inviteLink]);
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Einheit 2026`,
          text: "¡Únete a la misión y ayúdanos a abrir el muro!",
          url: `https://${inviteLink}`,
        });
      } catch (err) {
        console.log("Error al compartir", err);
      }
    } else {
      handleCopyCode();
    }
    setShowResultModal(true);
  }, [inviteLink, handleCopyCode]);
  return (
    <>
      <div
        className="absolute inset-0 -z-10 pointer-events-none
                   bg-cover bg-center bg-no-repeat
                   bg-[url('/bg-mobile-white.png')]
                   lg:bg-[size:100%_100%] lg:bg-center
                   lg:bg-[url('/backgrounds/mission/bg-mission-1.png')]"
      />
      <div className="flex flex-col w-full mx-auto px-4 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-start gap-8 w-full">
          <div className="flex flex-col justify-between w-full max-w-3xl gap-4 mb-5">
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="destructive"
                size="icon"
                className="w-8 h-8 rounded-xl bg-red-600 hover:bg-red-700 shrink-0"
              >
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 text-white" />
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className="text-blue-600">
                  Misión {mission.week_number}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 font-normal">
                  {mission.subtitle || "Lade dein Abi ein"}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-md sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-tight">
                  Invita a tu Abi
                </h1>
                <p className="text-sm text-slate-500">
                  <span className="font-light text-black">
                    Comparte tu enlace con tu Abi.
                  </span>{" "}
                  Cada persona que se une, suma puntos y abre más el muro.
                </p>
              </div>
            </div>
            <Card className="border border-slate-200/80 w-lg shadow-none rounded-md bg-white p-5">
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Comparte tu enlace de invitación
                </h3>
                <div className="flex flex-row items-center gap-2 w-full">
                  <div className="flex items-center w-full bg-white border border-slate-300 rounded-md px-4 py-3 shadow-sm">
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {loadingCode ? "Generando..." : inviteLink}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={handleCopyCode}
                      disabled={loadingCode}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "w-10 h-10 rounded-md border-red-500 bg-white hover:bg-red-50 text-red-600 shadow-sm",
                        copied &&
                          "border-emerald-500 bg-emerald-50 text-emerald-600",
                      )}
                      title="Copiar enlace"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                    <Button
                      onClick={handleShare}
                      disabled={loadingCode}
                      variant="outline"
                      size="icon"
                      className="w-10 h-10 rounded-md border-red-500 bg-white hover:bg-red-50 text-red-600 shadow-sm"
                      title="Compartir"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-black">
                Tu progreso va así
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="border border-slate-200/80 !px-2 !py-0 shadow-none rounded-2xl bg-white">
                  <CardContent className="flex items-center justify-center p-4 gap-2">
                    <div className="w-15 h-15 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                      <Gift className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-red-600">
                        {acceptedCount}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Invitaciones aceptadas
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200/80 !px-2 !py-0 shadow-none rounded-2xl bg-white">
                  <CardContent className="flex items-center justify-center p-4 gap-2">
                    <div className="w-15 h-15 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                      <Star className="w-10 h-10 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-amber-600">
                        {existingResponse?.points_earned || 0}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Puntos ganados
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200/80 !px-2 !py-0 shadow-none rounded-2xl bg-white">
                  <CardContent className="flex items-center justify-center p-4 gap-2">
                    <div className="w-15 h-15 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <LayoutGrid className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold text-blue-600">
                        5/8
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        Avance del muro
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <MascotCallout
            imageSrc="/mascot/otto-with-girlfriend.png"
            message={
              <>
                Entre más <span className="block">invites, más</span>
                <span className="text-red-600 block">puntos ganas</span>
              </>
            }
            orientation="horizontal"
            className="!w-fit self-end justify-self-center
                       [&>div:first-child]:!text-xs [&>div:first-child]:!max-w-[150px] [&>div:first-child]:!text-center
                       [&>div:last-child]:!w-[380px] [&>div:last-child]:!h-[280px]"
          />
        </div>
        <Card className="w-full bg-[#FFF9F2] border-slate-200/80 rounded-2xl shadow-none py-0">
          <CardContent className="flex items-center justify-between p-3 sm:p-4 gap-2">
            <div />
            <Button
              asChild
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium px-6 text-sm shadow-none shrink-0"
            >
              <Link href="/">
                <span>Volver al inicio</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <InviteDialog
          open={showResultModal}
          onOpenChange={setShowResultModal}
          pointsEarned={existingResponse?.points_earned || 0}
          onContinue={() => {
            setShowResultModal(false);
          }}
        />
      </div>
    </>
  );
}
