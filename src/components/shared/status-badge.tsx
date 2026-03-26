"use client";

import { useTranslations } from "next-intl";
import { getStatus, type StatusEntity } from "@/lib/status-config";

interface StatusBadgeProps {
  entity: StatusEntity;
  status: string;
  className?: string;
}

export function StatusBadge({ entity, status, className = "" }: StatusBadgeProps) {
  const t = useTranslations();
  const { bg, text, i18nKey } = getStatus(entity, status);

  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${bg} ${text} ${className}`}>
      {i18nKey ? t(i18nKey) : status}
    </span>
  );
}
