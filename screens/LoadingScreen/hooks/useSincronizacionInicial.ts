import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  initDB,
  verificarTablas,
  guardarListaActividadesxLote,
  guardarListaLotesXUsuarioSqLite,
  obtenerSemanaActivaSqLite,
  guardarSemanaActivaSqLite,
  eliminarDatosTablaSemanaActivaSqLite,
  SeleccionarDatosUsuario
} from "../../../src/services/sqlite";
import { obtenerListaDeActividadesPorUsuario } from "../../../src/services/ObtenerActividadesxLote";
import { AuthContext } from "../../../src/context/AuthContext";
import { obtenerListaLotesxUSuario } from "../../../src/services/ObtenerLotesxUsuario";
import { obtenerListaNavesxUsuario } from "../../../src/services/ObtenerNavesxUsuario";
import { useUser } from "../../../src/context/userContext";
import { useTransferenciaCat } from "../../../src/hooks/useTransferenciaCat";
import { guardarListaNave } from "../../../src/services/local/guardarListaDeNavesEnDbLocal";
import {
  InsertarEmpleadosASQLite,
  eliminarDatos
} from "../../../src/services/local/guardarListaDeEmpleadosEnDbLocal";
import { IRespuestaTransferenciaCat } from "../../../src/interfaces/IRespuestaTransferenciaCat1";
import { ErrorPaso, aErrorPaso, errorListaVacia, exigirInternet } from "../../../src/utils/sincronizacion";
import { ClavePaso, Fase, InfoPaso, PASOS, estadoInicial } from "../utils";

type Parametros = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Loading">;
  semanaActiva: RootStackParamList["Loading"]["semanaActiva"];
};

export function useSincronizacionInicial({ navigation, semanaActiva }: Parametros) {
  const { logout } = useContext(AuthContext);
  const { iduUsuario } = useUser();
  const { handleTransferenciaCat } = useTransferenciaCat();

  const [pasos, setPasos] = useState<Record<ClavePaso, InfoPaso>>(estadoInicial);
  const pasosRef = useRef(pasos);
  const [fase, setFase] = useState<Fase>("sincronizando");
  const faseRef = useRef(fase);
  faseRef.current = fase;
  const [pasoDetalle, setPasoDetalle] = useState<ClavePaso | null>(null);
  const ejecutando = useRef(false);

  // Mientras sincroniza, el botón atrás de Android no regresa a Login a media
  // carga. Con errores sí se permite (además de los botones de la pantalla).
  useFocusEffect(
    useCallback(() => {
      const manejador = BackHandler.addEventListener(
        "hardwareBackPress",
        () => faseRef.current === "sincronizando"
      );
      return () => manejador.remove();
    }, [])
  );

  const actualizarPaso = (clave: ClavePaso, cambios: Partial<InfoPaso>) => {
    pasosRef.current = {
      ...pasosRef.current,
      [clave]: { ...pasosRef.current[clave], ...cambios }
    };
    setPasos(pasosRef.current);
  };

  // Cada acción devuelve el resumen que se muestra al terminar bien, o lanza
  // ErrorPaso con el motivo.
  const acciones: Record<ClavePaso, () => Promise<string>> = {
    local: async () => {
      const lista = await initDB();
      if (!lista) {
        throw new ErrorPaso(
          "No se pudo preparar la base de datos del dispositivo.",
          "Cierre la app y vuelva a abrirla. Si continúa, puede que el almacenamiento del teléfono esté lleno."
        );
      }
      return "Base de datos lista";
    },

    actividades: async () => {
      await exigirInternet();
      const actividades = await obtenerListaDeActividadesPorUsuario({
        idu_usuario: Number(iduUsuario)
      });
      if (actividades.length === 0) throw await errorListaVacia("actividades");

      // Las actividades solo se reemplazan al cambiar de semana.
      const semana: any = await obtenerSemanaActivaSqLite();
      if (semana.length === 0 || semana[0].semanaActiva !== semanaActiva) {
        await eliminarDatosTablaSemanaActivaSqLite();
        await guardarSemanaActivaSqLite(semanaActiva);
        const guardado = await guardarListaActividadesxLote(actividades);
        if (!guardado) {
          throw new ErrorPaso(
            "No se pudieron guardar las actividades en el dispositivo.",
            "La descarga fue correcta pero falló el guardado local."
          );
        }
      }
      return `${actividades.length} actividades · semana ${semanaActiva}`;
    },

    lotes: async () => {
      await exigirInternet();
      const lotes = await obtenerListaLotesxUSuario({ idu_usuario: Number(iduUsuario) });
      if (lotes.length === 0) throw await errorListaVacia("lotes");
      if (!(await guardarListaLotesXUsuarioSqLite(lotes))) {
        throw new ErrorPaso("No se pudieron guardar los lotes en el dispositivo.");
      }
      return `${lotes.length} lotes guardados`;
    },

    naves: async () => {
      await exigirInternet();
      const naves = await obtenerListaNavesxUsuario({ idu_usuario: Number(iduUsuario) });
      if (naves.length === 0) throw await errorListaVacia("naves");
      if (!(await guardarListaNave(naves))) {
        throw new ErrorPaso("No se pudieron guardar las naves en el dispositivo.");
      }
      return `${naves.length} naves guardadas`;
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
      return `${empleados.length} empleados guardados`;
    },

    verificar: async () => {
      const tablas: any[] = await verificarTablas();
      if (!tablas || tablas.length === 0) {
        throw new ErrorPaso("No se encontraron las tablas locales.");
      }
      return `${tablas.length} tablas verificadas`;
    }
  };

  // Ejecuta en orden los pasos que aún no están completos (al reintentar solo
  // se repiten los que fallaron o quedaron pendientes).
  async function sincronizar() {
    if (ejecutando.current) return;
    ejecutando.current = true;
    setFase("sincronizando");

    let huboError = false;
    let fallaCritica = false;

    for (const paso of PASOS) {
      if (pasosRef.current[paso.clave].estado === "ok") continue;

      actualizarPaso(paso.clave, { estado: "proceso", mensaje: "Sincronizando…", error: undefined });
      try {
        const mensaje = await acciones[paso.clave]();
        actualizarPaso(paso.clave, { estado: "ok", mensaje });
      } catch (e: any) {
        huboError = true;
        const error = aErrorPaso(e);
        actualizarPaso(paso.clave, {
          estado: "error",
          mensaje: error.message,
          error: { mensaje: error.message, detalle: error.detalle }
        });
        if (paso.critico) {
          fallaCritica = true;
          break;
        }
      }
    }

    ejecutando.current = false;
    setFase(fallaCritica ? "critico" : huboError ? "conErrores" : "completo");
  }

  useEffect(() => {
    sincronizar();
  }, []);

  useEffect(() => {
    if (fase !== "completo") return;
    const t = setTimeout(() => navigation.navigate("Inicio"), 900);
    return () => clearTimeout(t);
  }, [fase]);

  const reintentar = () => {
    setPasoDetalle(null);
    sincronizar();
  };

  const volverAlLogin = async () => {
    await logout();
    navigation.navigate("Login");
  };

  const lista = PASOS.map((p) => ({ ...p, ...pasos[p.clave] }));
  const terminados = lista.filter((p) => p.estado === "ok" || p.estado === "error").length;
  const conError = lista.filter((p) => p.estado === "error").length;
  const progreso = terminados / PASOS.length;
  const detalle = pasoDetalle ? lista.find((p) => p.clave === pasoDetalle) : undefined;

  const titulo = {
    sincronizando: "Sincronizando información",
    completo: "Sincronización completa",
    conErrores: "Sincronización con errores",
    critico: "No se pudo sincronizar"
  }[fase];

  return {
    fase,
    titulo,
    lista,
    terminados,
    conError,
    progreso,
    detalle,
    setPasoDetalle,
    reintentar,
    volverAlLogin
  };
}
