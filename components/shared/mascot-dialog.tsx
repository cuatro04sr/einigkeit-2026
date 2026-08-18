import { MascotDialogProps } from "@/types";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  Dialog,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import Image from "next/image";

export function MascotDialog({
  open,
  onOpenChange,
  title,
  imageSrc,
  imageAlt = "Mascota",
  bgImageSrc,
  children,
}: MascotDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={bgImageSrc ? { backgroundImage: `url('${bgImageSrc}')` } : undefined}
        className={cn(
          "w-[95vw] lg:w-[900px] lg:max-w-none p-0 overflow-hidden rounded-3xl border-none shadow-2xl bg-white bg-cover bg-center bg-no-repeat",
          !bgImageSrc && "lg:bg-[url('/backgrounds/auth/dialog-desktop.png')]"
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full sm:flex-row items-center p-5 sm:p-10 gap-0 sm:gap-8 pt-8 sm:pt-10">
          <div className="relative w-full sm:w-1/2 h-[260px] sm:h-72 flex items-center justify-center -mt-2 sm:mt-0">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-contain object-bottom sm:object-center"
              priority
            />
          </div>
          <div className="relative w-full h-fit sm:w-1/2 flex items-center justify-center z-10">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
