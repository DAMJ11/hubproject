"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTemplateProps {
  children: ReactNode;
  className?: string;
}

// Template principal para páginas del sitio
export default function PageTemplate({ children, className = "" }: PageTemplateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.4,
        ease: "easeInOut"
      }}
      className={className}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ 
          duration: 0.5,
          ease: "easeOut",
          delay: 0.1
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Template específico para páginas del dashboard
export function DashboardPageTemplate({ children, className = "" }: PageTemplateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Template para modales y overlays
export function ModalTemplate({ children, className = "" }: PageTemplateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.2,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hook para animaciones de elementos de lista
export function useListAnimation(index: number = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.3,
      delay: index * 0.05,
      ease: "easeOut"
    }
  };
}

// Hook para animaciones de cards
export function useCardAnimation() {
  return {
    whileHover: { 
      y: -4,
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };
}