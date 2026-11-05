// resumen: estado del patrón y acciones. actual: dibujar el patrón vigente
// antes de cambiarlo o eliminarlo. nuevo/confirmar: dibujarlo dos veces.
export type Modo = "resumen" | "actual" | "nuevo" | "confirmar";
export type EstadoTrazo = "normal" | "error" | "ok";

export type AccionPatron = "cambiar" | "eliminar";
export type UsuarioPatron = { user: string; nombre: string };
export type AvisoPatron = { tipo: "ok" | "error"; texto: string };
