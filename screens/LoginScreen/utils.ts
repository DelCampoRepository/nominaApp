export const COLORES = {
  fondo: "#e5e9f4",
  tarjeta: "#ffffff",
  verde: "#13c044",
  verdeOscuro: "#008445",
  verdeSuave: "#e3f6e9",
  grisSuave: "#eef0f5",
  texto: "#1f2933",
  textoSuave: "#6b7280",
  error: "#d32f2f"
};

/**
 * Logging centralizado. En producción `console.log` no se ve en ningún lado,
 * así que si ya tienes Sentry/Bugsnag/otro, conecta aquí.
 * Por ahora solo evita que el código quede regado con console.log sueltos.
 */
export const logDebug = (...args: unknown[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

/**
 * Convierte el valor de expiración (string ISO, epoch numérico como string, etc.)
 * a un timestamp numérico. Devuelve null si no se puede interpretar,
 * para que el llamador decida tratarlo como "expirado" en vez de comparar
 * contra NaN (que siempre da `false` y fue la causa del bug original).
 */
export function parseExpiracion(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;

  // Si ya viene como epoch numérico (ms), aceptarlo directamente.
  if (typeof valor === "number" && !isNaN(valor)) return valor;

  if (typeof valor === "string") {
    // Epoch como string, ej "1755000000000"
    if (/^\d+$/.test(valor.trim())) {
      const asNumber = Number(valor);
      if (!isNaN(asNumber)) return asNumber;
    }

    // El backend (.NET) manda la fecha con 7 digitos de fraccion de
    // segundo -ticks de 100ns, ej "2026-09-04T19:06:27.3004347-07:00"-.
    // El parser de fechas de JS solo admite 3 digitos (milisegundos); con
    // mas digitos, Date(...) devuelve Invalid Date en motores como Hermes,
    // y por eso esta funcion terminaba devolviendo null SIEMPRE, sin
    // importar la hora real (expirado quedaba fijo en true). Se recorta la
    // fraccion a 3 digitos antes de parsear.
    const normalizado = valor.replace(/(\.\d{3})\d+/, "$1");
    const parsed = new Date(normalizado).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  return null;
}
