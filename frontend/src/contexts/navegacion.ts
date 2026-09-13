import { createContext, useContext } from "react";

// Permite saltar desde el panel admin a la PWA de cliente sin usar `window`
// (patrón legacy que reemplaza `window.abrirVistaCliente`).
export type AbrirVistaCliente = () => void;

export const AbrirVistaClienteContext = createContext<AbrirVistaCliente>(
  () => undefined,
);

export function useAbrirVistaCliente(): AbrirVistaCliente {
  return useContext(AbrirVistaClienteContext);
}
