import { useEffect } from "react";
import { supabase } from "../config/supabase";
import { usarMocks } from "../config/env";
import { refrescarMisTurnos, refrescarTurnosAdmin, useStore } from "../store";

// Agrupa ráfagas de eventos (una mutación de reagendado emite UPDATE + INSERT)
// en un único refetch para no golpear la API con una consulta por fila.
let temporizador: ReturnType<typeof setTimeout> | null = null;

function programarRefresco(refrescar: () => Promise<void>): void {
  if (temporizador) clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    refrescar().catch(() => undefined);
  }, 300);
}

// Mantiene sincronizadas las vistas Cliente <-> Admin ante cambios en la tabla
// turnos. Montado una sola vez desde App.tsx; abandona la suscripción cuando no
// hay credenciales de Supabase, en modo de prueba (mocks) o sin sesión.
function useRealtimeTurnos(): void {
  const rol = useStore((s) => s.sesion?.usuario.rol);
  const inicializado = useStore((s) => s.inicializado);

  useEffect(() => {
    if (usarMocks() || !supabase || !inicializado || !rol) return;

    const refrescar =
      rol === "cliente" ? refrescarMisTurnos : refrescarTurnosAdmin;

    const canal = supabase
      .channel("optiturno-turnos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "turnos" },
        () => programarRefresco(refrescar),
      )
      .subscribe();

    return () => {
      if (temporizador) clearTimeout(temporizador);
      supabase.removeChannel(canal).catch(() => undefined);
    };
  }, [inicializado, rol]);
}

export default function RealtimeSync() {
  useRealtimeTurnos();
  return null;
}
