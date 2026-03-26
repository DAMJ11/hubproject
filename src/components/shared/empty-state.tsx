import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
      <Icon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
      <p className="text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      {description && (
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <a href={action.href}>
              <Button className="bg-brand-600 hover:bg-brand-700 text-white">
                {action.label}
              </Button>
            </a>
          ) : (
            <Button onClick={action.onClick} className="bg-brand-600 hover:bg-brand-700 text-white">
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
