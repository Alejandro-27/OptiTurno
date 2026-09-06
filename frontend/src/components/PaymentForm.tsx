import React, { useEffect, useRef, useState } from "react";
import type { Stripe, StripeElements, StripePaymentElement } from "@stripe/stripe-js";
import { obtenerStripe } from "../lib/stripe";
import { MODO_DEMO } from "../config/env";

interface PaymentFormProps {
  clientSecret: string;
  monto: number;
  onExito: () => void;
  onError: (mensaje: string) => void;
}

// Formulario de pago con Payment Element de Stripe. En modo demo (sin backend
// real) no hay clientSecret válido, por lo que el botón simplemente confirma.
export default function PaymentForm({
  clientSecret,
  monto,
  onExito,
  onError,
}: PaymentFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const paymentElementRef = useRef<StripePaymentElement | null>(null);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    let cancelado = false;

    const montar = async () => {
      const stripe = await obtenerStripe();
      if (cancelado) return;
      if (!stripe) {
        setEstado("listo");
        return;
      }
      stripeRef.current = stripe;

      const elements = stripe.elements({ clientSecret: clientSecret });
      elementsRef.current = elements;

      const element = elements.create("payment", {
        layout: { type: "tabs", defaultCollapsed: false },
      });
      paymentElementRef.current = element;
      if (containerRef.current) {
        element.mount(containerRef.current);
      }
      setEstado("listo");
    };

    montar().catch(() => {
      if (!cancelado) setEstado("error");
    });

    return () => {
      cancelado = true;
      if (paymentElementRef.current) {
        paymentElementRef.current.unmount();
        paymentElementRef.current = null;
      }
    };
  }, [clientSecret]);

  const confirmarPago = async () => {
    if (procesando) return;
    setProcesando(true);

    // Modo demo: sin Stripe configurado confirmamos directo
    if (MODO_DEMO || !stripeRef.current || !paymentElementRef.current) {
      onExito();
      setProcesando(false);
      return;
    }

    try {
      const resultado = await stripeRef.current.confirmPayment({
        elements: elementsRef.current!,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/reservar-ok`,
        },
      });
      if (resultado.error) {
        const mensaje =
          resultado.error.type === "validation_error" ||
          (resultado.error.type as string) === "card_error" ||
          resultado.error.type === "invalid_request_error"
            ? resultado.error.message || "Datos de pago inválidos. Revisa tu tarjeta."
            : "No se pudo procesar el pago. Intenta nuevamente.";
        onError(mensaje);
      } else if (resultado.paymentIntent?.status === "succeeded") {
        onExito();
      } else {
        onError("El pago está pendiente. Espera la confirmación.");
      }
    } catch (err) {
      onError("No se pudo procesar el pago. Intenta nuevamente.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
        {estado === "cargando" && (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500">
            <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
            Cargando método de pago seguro…
          </div>
        )}
        <div
          ref={containerRef}
          className={estado === "cargando" ? "hidden" : "block"}
        />
      </div>

      <button
        onClick={confirmarPago}
        disabled={procesando || estado === "cargando" || (MODO_DEMO ? false : !paymentElementRef.current)}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
      >
        {procesando ? (
          <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <span className="text-base leading-none">💳</span>
        )}
        {procesando
          ? "Procesando pago..."
          : `Confirmar y pagar $${Math.round(monto).toLocaleString("es-CO")}`}
      </button>
    </div>
  );
}