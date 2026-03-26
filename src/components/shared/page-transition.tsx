"use client";

import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`animate-in fade-in slide-in-from-bottom-4 duration-300 ${className}`}>
      {children}
    </div>
  );
}

// Componente específico para formularios de auth con animación más elegante
export function AuthTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={`animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-350 ${className}`}>
      {children}
    </div>
  );
}

// Componente para elementos que aparecen escalonados
export function StaggeredTransition({ children, className = "", delay = 0 }: PageTransitionProps & { delay?: number }) {
  return (
    <div
      className={`animate-in fade-in slide-in-from-bottom-6 duration-400 fill-mode-both ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

// Clases CSS equivalentes para hover/tap en botones (reemplaza useButtonAnimation de framer-motion)
export function useButtonAnimation() {
  return {
    className: "transition-transform hover:scale-[1.02] active:scale-[0.98]",
  };
}