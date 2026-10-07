import React, { useEffect, useRef, useState } from "react";
import { ShieldAlert, X, Building2 } from "lucide-react";
import { actualizarNegocio, crearNegocio } from "../api/negocios.api";
import type { CrearNegocioInputDTO, NegocioAdminDTO } from "../api/dto";
import { esErrorInline, mensajeDeError } from "../api/dto";
import { useToast } from "../contexts/toast";
import { slugify } from "../utils/slugify";

interface Props {
  abierto: boolean;
  negocio: NegocioAdminDTO | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

const INPUT_CLS =
  "w-full bg-slate-50 dark:bg-slate-950 border border-border-subtle dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors";

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

// Alta/edición de un negocio (solo superadmin). En alta solo los datos del
// negocio: la primera sucursal se crea al abrir el negocio expandido.
export default function AdminNegocioForm({
  abierto,
  negocio,
  onCerrar,
  onGuardado,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const { mostrarToast } = useToast();
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    setSaving(false);
    setError(null);
    setSlugManual(false);
    if (negocio) {
      setNombre(negocio.nombre);
      setSlug(negocio.slug);
    } else {
      setNombre("");
      setSlug("");
    }
  }, [abierto, negocio]);

  if (!abierto) return null;

  const esEdicion = !!negocio;

  const handleNombreChange = (valor: string) => {
    setNombre(valor);
    if (!slugManual) setSlug(slugify(valor));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !slug.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const datos: CrearNegocioInputDTO = {
        nombre: nombre.trim(),
        slug: slug.trim(),
      };
      if (negocio) {
        await actualizarNegocio(negocio.id, datos);
        mostrarToast("Negocio actualizado correctamente.", "exito");
      } else {
        await crearNegocio(datos);
        mostrarToast("Negocio creado correctamente.", "exito");
      }
      onGuardado();
      onCerrar();
    } catch (err) {
      if (esErrorInline(err)) {
        setError(mensajeDeError(err, "No se pudo guardar el negocio."));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div className="bg-white dark:bg-slate-950 border border-border-subtle dark:border-slate-800 w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl rounded-2xl animate-scale-up flex flex-col">
        <div className="p-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <Building2
                size={16}
                className="text-indigo-600 dark:text-indigo-400"
              />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {esEdicion ? "Editar Negocio" : "Nuevo Negocio"}
              </h3>
            </div>
            <button
              onClick={onCerrar}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-6 space-y-4"
          >
            <Campo label="Nombre del negocio">
              <input
                type="text"
                required
                placeholder="Ej. Barbería El Elegante"
                value={nombre}
                onChange={(e) => handleNombreChange(e.target.value)}
                className={INPUT_CLS}
              />
            </Campo>

            <Campo label="Slug (URL amigable)">
              <input
                type="text"
                required
                placeholder="ej: barberia-el-elegante"
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlug(e.target.value);
                }}
                className={INPUT_CLS}
              />
            </Campo>
          </form>
        </div>

        <div className="mt-auto bg-slate-50 dark:bg-slate-950/60 p-4 border-t border-border-subtle dark:border-slate-800 flex flex-col gap-3 rounded-b-2xl">
          {error && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              <ShieldAlert size={14} />
              {error}
            </div>
          )}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => formRef.current?.requestSubmit()}
              disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-600/15"
            >
              {saving ? "Guardando..." : esEdicion ? "Guardar" : "Crear"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
