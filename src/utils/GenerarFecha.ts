 import dayjs from "dayjs";

 // Fecha local del dispositivo (YYYY-MM-DD). Es funcion y no constante para
 // que se calcule cada vez: una constante se evalua una sola vez al cargar la
 // app y se queda con la fecha de ese dia aunque la app siga abierta despues
 // de medianoche. No usar toISOString(): devuelve la fecha en UTC, que en
 // Mexico ya es el dia siguiente a partir de las 17:00/18:00.
 export const obtenerFecha = () => dayjs().format("YYYY-MM-DD");
