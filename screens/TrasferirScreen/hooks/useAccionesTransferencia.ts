import { obtenerListaLotesxUSuario } from "../../../src/services/ObtenerLotesxUsuario";
import { obtenerListaNavesxUsuario } from "../../../src/services/ObtenerNavesxUsuario";
import { guardarListaNave } from "../../../src/services/local/guardarListaDeNavesEnDbLocal";
import { useTransferenciaCat } from "../../../src/hooks/useTransferenciaCat";
import { GuardarAvancesEnDb } from "../../../src/services/GuardarAvancesAAsenar";
import {
  guardarListaLotesXUsuarioSqLite,
  guardarListaActividadesxLote,
  SeleccionarAvancesEmpleadosASyncronizar,
  ActualizarAvancesSincro,
  SeleccionarDatosUsuario,
  guardarListajefesNave
} from "../../../src/services/sqlite";
import { IRespuestaTransferenciaCat } from "../../../src/interfaces/IRespuestaTransferenciaCat1";
import { IEmpleadosParaAsentar } from "../../../src/interfaces/IEmpleadosParaAsentar";
import { IAvanceEmpleado } from "../../../src/interfaces/local/IAvanceEmpleado";
import {
  InsertarEmpleadosASQLite,
  eliminarDatos
} from "../../../src/services/local/guardarListaDeEmpleadosEnDbLocal";
import { obtenerListaDeActividadesPorUsuario } from "../../../src/services/ObtenerActividadesxLote";
import { obtenerJefesNave } from "../../../src/services/ObtenerJefesNave";
import { useUser } from "../../../src/context/userContext";
import { hayInternet } from "../../../src/utils/conexion";
import { obtenerFecha } from "../../../src/utils/GenerarFecha";
import { ErrorPaso, errorListaVacia, exigirInternet } from "../../../src/utils/sincronizacion";
import { ClaveOpcion, Resultado } from "../types";
import { semanaActivaLocal } from "../utils";

// Cada acción devuelve el resumen que se muestra al terminar bien, o lanza
// ErrorPaso con el motivo. Se construyen en cada render (igual que antes) para
// leer siempre el `iduUsuario` actual.
export function useAccionesTransferencia(): Record<ClaveOpcion, () => Promise<Resultado>> {
  const { iduUsuario } = useUser();
  const { handleTransferenciaCat } = useTransferenciaCat();

  const acciones: Record<ClaveOpcion, () => Promise<Resultado>> = {
    avances: async () => {
      await exigirInternet();
      const semanaActiva = await semanaActivaLocal();
      const fechaHoy = obtenerFecha();
      const lista = await SeleccionarAvancesEmpleadosASyncronizar(semanaActiva, fechaHoy);
      if (lista.length === 0) {
        return { mensaje: "No hay avances registrados hoy", sinDatos: true };
      }

      // Se agrupan los avances por lote y nave, como los espera el servidor.
      const lotesMap = new Map<string, IEmpleadosParaAsentar>();
      for (const empleado of lista) {
        const { cod_lote, cod_nave } = empleado;
        const key = `${cod_lote}_${cod_nave}`;
        if (!lotesMap.has(key)) lotesMap.set(key, { cod_lote, cod_nave, wDatos: [] });
        lotesMap.get(key)!.wDatos.push({
          cod_act: empleado.cod_actividad,
          cod_avn: empleado.cod_avance,
          cod_emp: empleado.cod_empleado,
          avances: empleado.avance,
          avancesA: empleado.avanceA,
          bandera: "",
          rendAplicado: empleado.Rendimiento_Aplic,
          estadoSincro: empleado.estadoSincro,
          MensajeSincro: empleado.MensajeSincro
        });
      }

      // GuardarAvancesEnDb devuelve [] si no se pudo sincronizar.
      const res: any = await GuardarAvancesEnDb(Array.from(lotesMap.values()));
      if (!Array.isArray(res) || res.length === 0) {
        throw (await hayInternet())
          ? new ErrorPaso(
              "El servidor no confirmó la recepción de los avances.",
              "Los registros siguen guardados en el dispositivo. Intente de nuevo; si el problema continúa, avise a sistemas."
            )
          : new ErrorPaso(
              "Se perdió la conexión al enviar los avances.",
              "Los registros siguen guardados en el dispositivo. Verifique su señal y presione Reintentar."
            );
      }

      for (const item of res) {
        const { cod_lote, cod_nave, wDatos } = item ?? {};
        if (!Array.isArray(wDatos)) continue;
        for (const empleado of wDatos) {
          // El servidor puede devolver el campo en camelCase o PascalCase;
          // nunca se manda undefined a SQLite.
          await ActualizarAvancesSincro({
            estadoSincro: empleado.estadoSincro ?? 0,
            MensajeSincro: empleado.mensajeSincro ?? empleado.MensajeSincro ?? "",
            cod_actividad: empleado.cod_act,
            cod_avance: empleado.cod_avn,
            cod_lote,
            cod_nave,
            cod_empleado: empleado.cod_emp,
            semanaActiva,
            fecha: fechaHoy
          } as IAvanceEmpleado);
        }
      }
      return {
        mensaje: `${lista.length} ${lista.length === 1 ? "registro enviado" : "registros enviados"}`
      };
    },

    lotes: async () => {
      await exigirInternet();
      const lotes = await obtenerListaLotesxUSuario({ idu_usuario: Number(iduUsuario) });
      if (lotes.length === 0) throw await errorListaVacia("lotes");
      if (!(await guardarListaLotesXUsuarioSqLite(lotes))) {
        throw new ErrorPaso("No se pudieron guardar los lotes en el dispositivo.");
      }
      return { mensaje: `${lotes.length} lotes actualizados` };
    },

    naves: async () => {
      await exigirInternet();
      const naves = await obtenerListaNavesxUsuario({ idu_usuario: Number(iduUsuario) });
      if (naves.length === 0) throw await errorListaVacia("naves");
      if (!(await guardarListaNave(naves))) {
        throw new ErrorPaso("No se pudieron guardar las naves en el dispositivo.");
      }
      return { mensaje: `${naves.length} naves actualizadas` };
    },

    empleados: async () => {
      await exigirInternet();
      const datosUser = await SeleccionarDatosUsuario();
      const idu = datosUser[0]?.idu_usuario ?? iduUsuario;
      const empleados = await handleTransferenciaCat({ wtipo: "1", idu_usuario: idu });
      if (!empleados || empleados.length === 0) throw await errorListaVacia("empleados");

      // Solo se reemplaza la lista local cuando llegó una nueva.
      await eliminarDatos();
      if (!(await InsertarEmpleadosASQLite(empleados as IRespuestaTransferenciaCat[]))) {
        throw new ErrorPaso("No se pudieron guardar los empleados en el dispositivo.");
      }
      return { mensaje: `${empleados.length} empleados actualizados` };
    },

    actividades: async () => {
      await exigirInternet();
      const actividades = await obtenerListaDeActividadesPorUsuario({
        idu_usuario: Number(iduUsuario)
      });
      if (actividades.length === 0) throw await errorListaVacia("actividades");
      if (!(await guardarListaActividadesxLote(actividades))) {
        throw new ErrorPaso("No se pudieron guardar las actividades en el dispositivo.");
      }
      return { mensaje: `${actividades.length} actividades actualizadas` };
    },

    jefes: async () => {
      await exigirInternet();
      const respuesta = await obtenerJefesNave({ idu_usuario: String(iduUsuario) });
      const jefes = respuesta?.jefesDeNave ?? [];
      if (jefes.length === 0) throw await errorListaVacia("jefes de nave");
      if (!(await guardarListajefesNave(jefes))) {
        throw new ErrorPaso("No se pudieron guardar los jefes de nave en el dispositivo.");
      }
      return { mensaje: `${jefes.length} jefes de nave actualizados` };
    }
  };

  return acciones;
}
