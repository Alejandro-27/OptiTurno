import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type TipoToast = "exito" | "error" | "info" | "alerta";

export interface ToastItem {
  id: number;
  tipo: TipoToast;
  mensaje: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  mostrarToast: (mensaje: string, tipo?: TipoToast) => void;
  descartar: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DURACION_AUTO = 4000;
const MAX_VISIBLES = 4;

// Registro puente para el interceptor de axios (fuera de React):
// ToastProvider se registra al montar; api.client.ts usa notificarExterno.
let pushExterno: ((mensaje: string, tipo?: TipoToast) => void) | null = null;

export function notificarExterno(
  mensaje: string,
  tipo: TipoToast = "info",
): void {
  pushExterno?.(mensaje, tipo);
}

let siguienteId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const descartar = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const mostrarToast = useCallback(
    (mensaje: string, tipo: TipoToast = "info") => {
      setToasts((prev) => {
        if (prev.some((t) => t.tipo === tipo && t.mensaje === mensaje)) {
          return prev;
        }
        const item: ToastItem = { id: siguienteId++, tipo, mensaje };
        return [...prev.slice(-(MAX_VISIBLES - 1)), item];
      });
    },
    [],
  );

  useEffect(() => {
    toasts.forEach((t) => {
      if (!timers.current.has(t.id)) {
        timers.current.set(
          t.id,
          setTimeout(() => descartar(t.id), DURACION_AUTO),
        );
      }
    });
  }, [toasts, descartar]);

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  useEffect(() => {
    pushExterno = mostrarToast;
    return () => {
      pushExterno = null;
    };
  }, [mostrarToast]);

  const value = useMemo(
    () => ({ toasts, mostrarToast, descartar }),
    [toasts, mostrarToast, descartar],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>.");
  return ctx;
}
