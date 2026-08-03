import { HelpCircle, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import * as Icons from "lucide-react";

export function OptionIcon({
  iconName,
  className,
}: {
  iconName?: string;
  className?: string;
}) {
  if (!iconName) {
    return <HelpCircle className={className} />;
  }
  const lucideIcons = Icons as unknown as Record<
    string,
    ComponentType<LucideProps>
  >;
  const IconComponent = lucideIcons[iconName];
  if (!IconComponent) {
    return <HelpCircle className={className} />;
  }
  return <IconComponent className={className} />;
}
