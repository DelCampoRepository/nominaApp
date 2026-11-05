import { IAvanceEmpleado } from "../../src/interfaces/local/IAvanceEmpleado";

export const ICONO_LOTE = require("../../assets/land-plots.png");
export const ICONO_NAVE = require("../../assets/hoop-house.png");
export const ICONO_ACTIVIDAD = require("../../assets/sprout.png");
export const ICONO_EMPLEADO = require("../../assets/account.png");
export const ICONO_REPORTE = require("../../assets/file-chart-outline.png");

export const capitalizar = (texto: string) =>
  (texto ?? "")
    .trim()
    .toLowerCase()
    .replace(/^\S/, (l) => l.toUpperCase());

export const capitalizarNombre = (texto: string) =>
  (texto ?? "")
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\S/g, (l) => l.toUpperCase());

// Hasta 2 decimales, sin ceros de sobra.
export const formatear = (n: number) => (Number.isFinite(n) ? String(Math.round(n * 100) / 100) : "—");

export const jornales = (avance: number, rendApli: number) =>
  Number(rendApli) > 0 ? avance / Number(rendApli) : NaN;

// Estado de sincronización de un registro, como lo deja Transferir:
// estadoSincro 0 = aún no se envía (o el servidor lo rechazó y dejó mensaje).
export type EstadoRegistro = "sincronizado" | "pendiente" | "rechazado";

export function estadoRegistro(r: IAvanceEmpleado): EstadoRegistro {
  if (Number(r.estadoSincro) !== 0) return "sincronizado";
  return String(r.MensajeSincro ?? "").trim() === "" ? "pendiente" : "rechazado";
}

export function textoEstado(r: IAvanceEmpleado) {
  const mensaje = String(r.MensajeSincro ?? "").trim();
  if (mensaje) return capitalizar(mensaje);
  return estadoRegistro(r) === "sincronizado" ? "Sincronizado" : "No sincronizado";
}

export interface SeccionActividad {
  clave: string;
  codigo: string;
  nombre: string;
  registros: IAvanceEmpleado[];
  total: number;
  jornales: number;
}

// Agrupa los registros por actividad (código + avance), en el orden en que
// aparecen.
export function agruparPorActividad(datos: IAvanceEmpleado[]): SeccionActividad[] {
  const grupos = new Map<string, IAvanceEmpleado[]>();
  for (const r of datos) {
    const clave = `${r.cod_actividad}|${r.cod_avance}`;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave)!.push(r);
  }
  return [...grupos.entries()].map(([clave, registros]) => {
    const total = registros.reduce((s, r) => s + Number(r.avanceA), 0);
    return {
      clave,
      codigo: `${registros[0].cod_actividad}-${registros[0].cod_avance}`,
      nombre: registros[0].des_actividad,
      registros,
      total,
      jornales: jornales(total, registros[0].Rendimiento_Aplic)
    };
  });
}
