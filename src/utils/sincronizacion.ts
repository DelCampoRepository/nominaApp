import { hayInternet } from "./conexion";

// Error de un paso de sincronización: `message` es lo que ve el usuario y
// `detalle` la causa o qué hacer.
export class ErrorPaso extends Error {
  detalle?: string;
  constructor(mensaje: string, detalle?: string) {
    super(mensaje);
    this.detalle = detalle;
  }
}

// Convierte cualquier error atrapado en un ErrorPaso.
export function aErrorPaso(e: any): ErrorPaso {
  return e instanceof ErrorPaso
    ? e
    : new ErrorPaso("Ocurrió un error inesperado.", String(e?.message ?? e));
}

// Los servicios devuelven [] tanto si el usuario no tiene datos como si falló
// la petición; se revisa la conexión para dar un motivo más preciso.
export async function errorListaVacia(entidad: string): Promise<ErrorPaso> {
  if (!(await hayInternet())) {
    return new ErrorPaso(
      `No se pudieron descargar los ${entidad}.`,
      "Se perdió la conexión a internet durante la descarga. Verifique su señal y presione Reintentar."
    );
  }
  return new ErrorPaso(
    `El servidor no devolvió ${entidad} para este usuario.`,
    `Puede que el usuario no tenga ${entidad} asignados o que el servidor no haya respondido correctamente. Se conservan los datos que ya había en el dispositivo.`
  );
}

export async function exigirInternet() {
  if (!(await hayInternet())) {
    throw new ErrorPaso(
      "No hay conexión a internet.",
      "Verifique su señal y presione Reintentar."
    );
  }
}
