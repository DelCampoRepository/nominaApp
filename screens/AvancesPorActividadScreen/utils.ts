export const ICONO_EMPLEADO = require("../../assets/account.png");
export const ICONO_ACTIVIDAD = require("../../assets/sprout.png");

export const capitalizar = (texto: string) =>
  (texto ?? "")
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (l) => l.toUpperCase());

// Hasta 2 decimales, sin ceros de sobra (12.5 → "12.5", 3 → "3").
export const formatear = (n: number) =>
  Number.isFinite(n) ? String(Math.round(n * 100) / 100) : "—";

// Jornales = avance / rendimiento aplicado. Sin rendimiento no se puede calcular.
export const calcularJornales = (avance: number, rendApli: number) =>
  Number(rendApli) > 0 ? avance / Number(rendApli) : NaN;

// Mismo formato que se aceptaba antes: dígitos con punto decimal opcional.
const FORMATO_AVANCE = /^(\d+(\.\d*)?|\.\d*)?$/;

export type ResultadoValidacion =
  | { valido: true; valor: number; jornales: number }
  | { valido: false; mensaje: string; jornales: number };

// Valida un avance escrito: formato numérico y que los jornales no superen el
// tope de la actividad.
export function validarAvance(texto: string, rendApli: number, rendTop: number): ResultadoValidacion {
  const limpio = texto.replace(",", ".").trim();
  if (limpio !== "" && !FORMATO_AVANCE.test(limpio)) {
    return { valido: false, mensaje: "Escribe solo números (por ejemplo 12.5).", jornales: NaN };
  }
  const valor = parseFloat(limpio);
  const avance = isNaN(valor) ? 0 : valor;
  const jornales = calcularJornales(avance, rendApli);
  if (Number.isFinite(jornales) && jornales > Number(rendTop)) {
    return {
      valido: false,
      mensaje: `Supera el tope de ${formatear(Number(rendTop))} jornales para esta actividad.`,
      jornales
    };
  }
  return { valido: true, valor: avance, jornales };
}
