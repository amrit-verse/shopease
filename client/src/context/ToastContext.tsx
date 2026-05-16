import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "info";
type Toast = { id: number; message: string; kind: ToastKind };

type ToastCtx = {
  toast: (message: string, kind?: ToastKind) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto min-w-[240px] max-w-sm rounded-lg shadow-lg border px-4 py-3 text-sm font-medium animate-[slideIn_.2s_ease-out] ${
              t.kind === "success"
                ? "bg-white border-emerald-200 text-emerald-800"
                : t.kind === "error"
                ? "bg-white border-rose-200 text-rose-800"
                : "bg-white border-indigo-200 text-indigo-800"
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-0.5 inline-block h-2 w-2 rounded-full ${
                  t.kind === "success"
                    ? "bg-emerald-500"
                    : t.kind === "error"
                    ? "bg-rose-500"
                    : "bg-indigo-500"
                }`}
              />
              <span className="flex-1">{t.message}</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
