"use client";

import { useEffect, useState } from "react";

interface StatItem {
  value: string;
  color: string;
  label: string;
}

export default function StatsCarousel({ stats }: { stats: StatItem[] }) {
  const [index, setIndex] = useState(0);

  // Siempre corre el timer — CSS controla cuál versión se muestra
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % stats.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [stats.length]);

  return (
    <>
      {/* ── MÓVIL: una card a la vez con translateX suave ── */}
      <div className="mt-12 sm:hidden overflow-hidden">
        <div
          className="flex"
          style={{
            transform: `translateX(calc(-${index} * 100%))`,
            transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {stats.map((stat, i) => (
            // min-w-full = 100% del overflow-hidden padre, no del track entero
            <div key={i} className="min-w-full flex justify-center py-1">
              <div className="flex flex-col items-center justify-center bg-white border border-[#D1C1F2] rounded-xl px-10 py-5 shadow-sm w-4/5 max-w-[280px]">
                <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                <span className="text-sm text-[#9279BA] mt-1 text-center">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Indicadores de posición */}
        <div className="flex justify-center gap-2 mt-4">
          {stats.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-6 bg-[#7e7cf3]" : "w-1.5 bg-[#D1C1F2]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── DESKTOP: 3 cards estáticas centradas ── */}
      <div className="hidden sm:flex sm:justify-center sm:gap-6 mt-12">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center bg-white border border-[#D1C1F2] rounded-xl px-10 py-5 shadow-sm min-w-[160px]"
          >
            <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            <span className="text-sm text-[#9279BA] mt-1">{stat.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

