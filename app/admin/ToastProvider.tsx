"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";

type Tipo = "sucesso" | "erro";
type Toast = { id: number; mensagem: string; tipo: Tipo };

type ToastContextType = {
  showToast: (mensagem: string, tipo?: Tipo) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast precisa estar dentro de <ToastProvider>");
  }
  return ctx;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((mensagem: string, tipo: Tipo = "sucesso") => {
    const id = Date.now() + Math.random();
    setToasts((atual) => [...atual, { id, mensagem, tipo }]);
    setTimeout(() => {
      setToasts((atual) => atual.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 px-4 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm border animate-fade-in-up ${
              t.tipo === "sucesso"
                ? "bg-graphite border-silver text-silver-bright"
                : "bg-graphite border-red-500/50 text-red-400"
            }`}
          >
            <span>{t.tipo === "sucesso" ? "✓" : "!"}</span>
            {t.mensagem}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
