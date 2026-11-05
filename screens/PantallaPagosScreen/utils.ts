import { IAvanceUI } from "../../src/interfaces/IAvancesNomina";

export const ICONO_JEFE = require("../../assets/account-cowboy-hat.png");
export const ICONO_NAVE = require("../../assets/hoop-house.png");
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

export const formatear = (n: number) => (Number.isFinite(n) ? String(Math.round(n * 100) / 100) : "—");

export const jornales = (avance: number, rendimiento: number) =>
  Number(rendimiento) > 0 ? Number(avance) / Number(rendimiento) : NaN;

// Un avance del servidor se identifica por lote, nave, actividad, avance y
// empleado (igual que antes al marcarlo).
export const claveAvance = (a: IAvanceUI) =>
  `${a.Cod_lote}|${a.Cod_nave}|${a.Cod_actividad}|${a.Cod_avance}|${a.Cod_empleado}`;

export const estaMarcado = (a: IAvanceUI) => Number(a.Seleccionado) === 1;

// Fecha de hoy como la espera el servicio: AAAAMMDD.
export function fechaConsulta(): string {
  const f = new Date();
  return (
    f.getFullYear().toString() +
    (f.getMonth() + 1).toString().padStart(2, "0") +
    f.getDate().toString().padStart(2, "0")
  );
}

export interface GrupoNave {
  codigo: string;
  nombre: string;
  avances: IAvanceUI[];
  total: number;
}

export function agruparPorNave(avances: IAvanceUI[]): GrupoNave[] {
  const grupos = new Map<string, IAvanceUI[]>();
  for (const a of avances) {
    if (!grupos.has(a.Cod_nave)) grupos.set(a.Cod_nave, []);
    grupos.get(a.Cod_nave)!.push(a);
  }
  return [...grupos.entries()].map(([codigo, lista]) => ({
    codigo,
    nombre: lista[0].nom_nave ?? "",
    avances: lista,
    total: lista.reduce((s, a) => s + Number(a.Avance), 0)
  }));
}
