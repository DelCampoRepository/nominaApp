 import dayjs from "dayjs";

 // Fecha local del dispositivo (YYYY-MM-DD). Es funcion y no constante para
 // que se calcule cada vez: una constante se evalua una sola vez al cargar la
 // app y se queda con la fecha de ese dia aunque la app siga abierta despues
 // de medianoche. No usar toISOString(): devuelve la fecha en UTC, que en
 // Mexico ya es el dia siguiente a partir de las 17:00/18:00.
 export const obtenerFecha = () => dayjs().format("YYYY-MM-DD");

// "2026-03-19 16:41:55.803" -> "16:41". Vacío si no trae hora.
export const horaDe = (fechaHora: string | null | undefined) => {
  const m = String(fechaHora ?? "").match(/[ T](\d{2}:\d{2})/);
  return m ? m[1] : "";
};

// Compara dos fechas con hora para ordenar del más antiguo al más reciente;
// las que no traen hora van al final.
export const compararFechaHora = (a: string | null | undefined, b: string | null | undefined) => {
  const x = String(a ?? "").replace("T", " ");
  const y = String(b ?? "").replace("T", " ");
  const sinHoraX = x.length <= 10;
  const sinHoraY = y.length <= 10;
  if (sinHoraX !== sinHoraY) return sinHoraX ? 1 : -1;
  return x < y ? -1 : x > y ? 1 : 0;
};
