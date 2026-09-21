import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// ============================================================
// Capa de caché con fallback automático.
// - Con REDIS_URL configurada y saludable: usa Redis (compartido).
// - Si Redis no está configurado, se cae la conexión o un comando falla:
//   se usa una caché en memoria local (también con TTL), por lo que la
//   aplicación NUNCA se interrumpe y sigue consultando PostgreSQL/Supabase.
// ============================================================

export type ValorCache = unknown;

export interface InterfazCache {
  get<T>(clave: string): Promise<T | null>;
  set(clave: string, valor: ValorCache, ttlSegundos: number): Promise<void>;
  del(patron: string): Promise<void>;
}

// ── Implementación en memoria (fallback) ──────────────────────────
class CacheMemoria implements InterfazCache {
  private mapa = new Map<string, { valor: ValorCache; expira: number }>();

  async get<T>(clave: string): Promise<T | null> {
    const entrada = this.mapa.get(clave);
    if (!entrada) return null;
    if (entrada.expira < Date.now()) {
      this.mapa.delete(clave);
      return null;
    }
    return entrada.valor as T;
  }

  async set(
    clave: string,
    valor: ValorCache,
    ttlSegundos: number,
  ): Promise<void> {
    this.mapa.set(clave, {
      valor,
      expira: Date.now() + ttlSegundos * 1000,
    });
    if (this.mapa.size > 500) this.limpiarExpirados();
  }

  async del(patron: string): Promise<void> {
    if (patron.includes("*")) {
      const prefijo = patron.slice(0, patron.indexOf("*"));
      for (const clave of this.mapa.keys()) {
        if (clave.startsWith(prefijo)) this.mapa.delete(clave);
      }
      return;
    }
    this.mapa.delete(patron);
  }

  private limpiarExpirados(): void {
    const ahora = Date.now();
    for (const [clave, entrada] of this.mapa) {
      if (entrada.expira < ahora) this.mapa.delete(clave);
    }
  }
}

// ── Implementación con Redis (principal) ──────────────────────────
const urlRedis = process.env.REDIS_URL?.trim();

export const redis: Redis | null = urlRedis
  ? new Redis(urlRedis, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (tiempos) => Math.min(tiempos * 200, 2000),
    })
  : null;

if (redis) {
  redis.on("error", (err) => {
    console.warn("⚠️  Redis:", err.message);
  });
}

class CacheRedis implements InterfazCache {
  constructor(private cliente: Redis) {}

  async get<T>(clave: string): Promise<T | null> {
    const crudo = await this.cliente.get(clave);
    if (!crudo) return null;
    try {
      return JSON.parse(crudo) as T;
    } catch {
      return null;
    }
  }

  async set(
    clave: string,
    valor: ValorCache,
    ttlSegundos: number,
  ): Promise<void> {
    await this.cliente.set(clave, JSON.stringify(valor), "EX", ttlSegundos);
  }

  async del(patron: string): Promise<void> {
    if (patron.includes("*")) {
      let cursor = "0";
      do {
        const [siguiente, claves] = await this.cliente.scan(
          cursor,
          "MATCH",
          patron,
          "COUNT",
          100,
        );
        cursor = siguiente;
        if (claves.length > 0) await this.cliente.del(...claves);
      } while (cursor !== "0");
      return;
    }
    await this.cliente.del(patron);
  }
}

// ── Fachada: Redis con respaldo automático en memoria ─────────────
class CacheConRespaldo implements InterfazCache {
  constructor(
    private principal: InterfazCache,
    private respaldo: InterfazCache,
  ) {}

  async get<T>(clave: string): Promise<T | null> {
    try {
      const valor = await this.principal.get<T>(clave);
      return valor !== null ? valor : this.respaldo.get<T>(clave);
    } catch {
      return this.respaldo.get<T>(clave);
    }
  }

  async set(
    clave: string,
    valor: ValorCache,
    ttlSegundos: number,
  ): Promise<void> {
    try {
      await this.principal.set(clave, valor, ttlSegundos);
    } catch {
      await this.respaldo.set(clave, valor, ttlSegundos);
    }
  }

  async del(patron: string): Promise<void> {
    try {
      await this.principal.del(patron);
      await this.respaldo.del(patron);
    } catch {
      await this.respaldo.del(patron);
    }
  }
}

const memoria = new CacheMemoria();

export const cache: InterfazCache = redis
  ? new CacheConRespaldo(new CacheRedis(redis), memoria)
  : memoria;

if (!redis) {
  console.warn(
    "⚠️  REDIS_URL no configurada: usando caché en memoria (fallback). Para caché compartida agrega una instancia de Redis.",
  );
}

// ── Helper para cachear lecturas con TTL ──────────────────────────
// Cachea el resultado de `origen()` bajo `clave` durante `ttlSegundos`.
// Fallback transparente: si la caché falla, ejecuta `origen()` directo.
export async function leerConCache<T>(
  clave: string,
  ttlSegundos: number,
  origen: () => Promise<T>,
): Promise<T> {
  const cacheado = await cache.get<T>(clave);
  if (cacheado !== null) return cacheado;
  const datos = await origen();
  await cache.set(clave, datos, ttlSegundos);
  return datos;
}

// ── Invalidación centralizada de prefijos ─────────────────────────
// Cada mutación lista los prefijos que se ven afectados y borra solo esas
// claves (DEL por patrón), nunca toda la base de Redis.
export const invalidar = async (...patrones: string[]): Promise<void> => {
  await Promise.all(patrones.map((p) => cache.del(p)));
};

export const CLAVES = {
  servicios: (sucursalId: string) => `ot:servicios:suc:${sucursalId}`,
  serviciosSucursal: "ot:servicios:suc:*",
  profesionales: (sucursalId: string) => `ot:profesionales:suc:${sucursalId}`,
  profesionalesSucursal: "ot:profesionales:suc:*",
  sucursales: "ot:sucursales:all",
  sucursalPorId: (sucursalId: string) => `ot:sucursal:id:${sucursalId}`,
  sucursalDeUsuario: (usuarioId: string) => `ot:sucursal:usr:${usuarioId}`,
  disponibilidad: (profesionalId: string, fecha: string) =>
    `ot:disp:${profesionalId}:${fecha}`,
  dispGeneral: "ot:disp:*",
  turnosAdmin: (sucursalId: string) => `ot:turnos:suc:${sucursalId}`,
  turnosAdminGeneral: "ot:turnos:suc:*",
  turnosCliente: (usuarioId: string) => `ot:turnos:cli:${usuarioId}`,
  turnosClienteGeneral: "ot:turnos:cli:*",
  horarios: (profesionalId: string) => `ot:horarios:${profesionalId}`,
  horariosGeneral: "ot:horarios:*",
  disponibilidadSemanal: (sucursalId: string) =>
    `ot:disp-sem:suc:${sucursalId}`,
  dispSemanalGeneral: "ot:disp-sem:suc:*",
  actividad: (sucursalId: string) => `ot:actividad:suc:${sucursalId}`,
  actividadGeneral: "ot:actividad:suc:*",
  ausencias: (profesionalId: string) => `ot:ausencias:${profesionalId}`,
  ausenciasGeneral: "ot:ausencias:*",
} as const;
