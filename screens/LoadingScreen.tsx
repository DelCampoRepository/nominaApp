import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import {
  View,
  StyleSheet,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  BackHandler
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Text, ActivityIndicator, ProgressBar, Button } from "react-native-paper";
// Íconos PNG de assets/: las fuentes de íconos (@expo/vector-icons) no se
// muestran en la build de la app.
const ICONO_REINTENTAR = require("../assets/sync.png");
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  initDB,
  verificarTablas,
  guardarListaActividadesxLote,
  guardarListaLotesXUsuarioSqLite,
  obtenerSemanaActivaSqLite,
  guardarSemanaActivaSqLite,
  eliminarDatosTablaSemanaActivaSqLite,
  SeleccionarDatosUsuario
} from "../src/services/sqlite";
import { obtenerListaDeActividadesPorUsuario } from "../src/services/ObtenerActividadesxLote";
import { AuthContext } from "../src/context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { obtenerListaLotesxUSuario } from "../src/services/ObtenerLotesxUsuario";
import { obtenerListaNavesxUsuario } from "../src/services/ObtenerNavesxUsuario";
import { useUser } from "../src/context/userContext";
import { useTransferenciaCat } from "../src/hooks/useTransferenciaCat";
import { guardarListaNave } from "../src/services/local/guardarListaDeNavesEnDbLocal";
import {
  InsertarEmpleadosASQLite,
  eliminarDatos
} from "../src/services/local/guardarListaDeEmpleadosEnDbLocal";
import { IRespuestaTransferenciaCat } from "../src/interfaces/IRespuestaTransferenciaCat1";
import { ErrorPaso, aErrorPaso, errorListaVacia, exigirInternet } from "../src/utils/sincronizacion";
import ModalErrorSincronizacion from "../src/components/ModalErrorSincronizacion";

type Props = NativeStackScreenProps<RootStackParamList, "Loading">;

const COLORES = {
  fondo: "#e5e9f4",
  tarjeta: "#ffffff",
  verde: "#13c044",
  verdeOscuro: "#008445",
  verdeBarra: "#03871d",
  verdeSuave: "#e3f6e9",
  gris: "#c3c3c3",
  grisSuave: "#eef0f5",
  texto: "#1f2933",
  textoSuave: "#6b7280",
  error: "#d32f2f",
  errorSuave: "#fdecea"
};

type EstadoPaso = "pendiente" | "proceso" | "ok" | "error";
type ClavePaso =
  | "local"
  | "actividades"
  | "lotes"
  | "naves"
  | "empleados"
  | "verificar";

type DefinicionPaso = {
  clave: ClavePaso;
  titulo: string;
  icono: ImageSourcePropType;
  // Si falla, no se puede continuar a Inicio (sin actividades la app no sirve).
  critico?: boolean;
};

type InfoPaso = {
  estado: EstadoPaso;
  mensaje: string;
  error?: { mensaje: string; detalle?: string };
};

const PASOS: DefinicionPaso[] = [
  { clave: "local", titulo: "Base de datos local", icono: require("../assets/database-plus-outline.png") },
  { clave: "actividades", titulo: "Actividades", icono: require("../assets/sprout.png"), critico: true },
  { clave: "lotes", titulo: "Lotes", icono: require("../assets/land-fields.png") },
  { clave: "naves", titulo: "Naves", icono: require("../assets/hoop-house.png") },
  { clave: "empleados", titulo: "Empleados", icono: require("../assets/account.png") },
  { clave: "verificar", titulo: "Verificación de tablas", icono: require("../assets/database_search.png") }
];

const estadoInicial = (): Record<ClavePaso, InfoPaso> =>
  PASOS.reduce(
    (acc, p) => ({ ...acc, [p.clave]: { estado: "pendiente", mensaje: "En espera" } }),
    {} as Record<ClavePaso, InfoPaso>
  );


type Fase = "sincronizando" | "completo" | "conErrores" | "critico";

export default function LoadingScreen({ route, navigation }: Props) {
  const { nomUsuario, semanaActiva } = route.params;
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.encabezado}>
        <Image source={require("../assets/delcamp.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.subtitulo}>
          {nomUsuario ? `${nomUsuario} · ` : ""}Semana {semanaActiva}
        </Text>
      </View>

      <View style={styles.tarjetaProgreso}>
        <View style={styles.filaProgreso}>
          <Text style={styles.porcentaje}>{Math.round(progreso * 100)}%</Text>
          <Text style={styles.textoSuave}>
            {terminados} de {PASOS.length} pasos
            {conError > 0 ? ` · ${conError} con error` : ""}
          </Text>
        </View>
        <ProgressBar
          progress={progreso}
          color={conError > 0 ? COLORES.error : COLORES.verdeBarra}
          style={styles.barra}
        />
      </View>

      <ScrollView style={styles.lista} contentContainerStyle={{ paddingBottom: 16 }}>
        {lista.map((paso, i) => (
          <FilaPaso
            key={paso.clave}
            titulo={paso.titulo}
            icono={paso.icono}
            estado={paso.estado}
            mensaje={paso.mensaje}
            ultimo={i === lista.length - 1}
            onPress={paso.estado === "error" ? () => setPasoDetalle(paso.clave) : undefined}
          />
        ))}
      </ScrollView>

      {fase === "conErrores" && (
        <View style={styles.acciones}>
          <Button mode="outlined" textColor={COLORES.verdeOscuro} style={[styles.boton, styles.botonContorno]} onPress={() => navigation.navigate("Inicio")}>
            Continuar
          </Button>
          <Button mode="contained" buttonColor={COLORES.verdeOscuro} style={styles.boton} icon={ICONO_REINTENTAR} onPress={reintentar}>
            Reintentar
          </Button>
        </View>
      )}

      {fase === "critico" && (
        <View style={styles.acciones}>
          <Button mode="outlined" textColor={COLORES.verdeOscuro} style={[styles.boton, styles.botonContorno]} onPress={volverAlLogin}>
            Ir al login
          </Button>
          <Button mode="contained" buttonColor={COLORES.verdeOscuro} style={styles.boton} icon={ICONO_REINTENTAR} onPress={reintentar}>
            Reintentar
          </Button>
        </View>
      )}

      <ModalErrorSincronizacion
        visible={!!detalle}
        titulo={detalle?.titulo ?? ""}
        mensaje={detalle?.error?.mensaje}
        detalle={detalle?.error?.detalle}
        onCerrar={() => setPasoDetalle(null)}
        onReintentar={reintentar}
        reintentarDeshabilitado={fase === "sincronizando"}
      />
    </SafeAreaView>
  );
}

type FilaPasoProps = {
  titulo: string;
  icono: ImageSourcePropType;
  estado: EstadoPaso;
  mensaje: string;
  ultimo: boolean;
  onPress?: () => void;
};

function FilaPaso({ titulo, icono, estado, mensaje, ultimo, onPress }: FilaPasoProps) {
  const colorEstado = {
    pendiente: COLORES.gris,
    proceso: COLORES.verde,
    ok: COLORES.verde,
    error: COLORES.error
  }[estado];

  const fondoIcono = {
    pendiente: COLORES.grisSuave,
    proceso: COLORES.verdeSuave,
    ok: COLORES.verdeSuave,
    error: COLORES.errorSuave
  }[estado];

  return (
    <View style={styles.fila}>
      <View style={styles.lineaTiempo}>
        <View style={[styles.circulo, { backgroundColor: fondoIcono, borderColor: colorEstado }]}>
          <Image
            source={icono}
            style={[styles.iconoPaso, { tintColor: estado === "pendiente" ? COLORES.textoSuave : colorEstado }]}
          />
        </View>
        {!ultimo && (
          <View style={[styles.conector, { backgroundColor: estado === "ok" ? COLORES.verde : COLORES.gris }]} />
        )}
      </View>

      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          styles.tarjetaPaso,
          estado === "error" && styles.tarjetaError,
          estado === "proceso" && styles.tarjetaProceso,
          pressed && { opacity: 0.7 }
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.tituloPaso, estado === "pendiente" && { color: COLORES.textoSuave }]}>
            {titulo}
          </Text>
          <Text
            style={[styles.mensajePaso, estado === "error" && { color: COLORES.error }]}
            numberOfLines={2}
          >
            {mensaje}
          </Text>
          {estado === "error" && <Text style={styles.verDetalle}>Toca para ver el detalle</Text>}
        </View>
        <View style={styles.estado}>
          {estado === "proceso" && <ActivityIndicator size={20} color={COLORES.verde} />}
          {estado === "ok" && (
            <View style={styles.insigniaOk}>
              <Image source={require("../assets/check-bold.png")} style={[styles.iconoEstado, { width: 14, height: 14, tintColor: "#ffffff" }]} />
            </View>
          )}
          {estado === "error" && (
            <Image source={require("../assets/arrow-left.png")} style={[styles.iconoEstado, styles.flechaDerecha, { tintColor: COLORES.error }]} />
          )}
          {estado === "pendiente" && <View style={styles.puntoPendiente} />}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    paddingHorizontal: 16
  },
  encabezado: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 12
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 8
  },
  titulo: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORES.texto
  },
  subtitulo: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 2
  },
  tarjetaProgreso: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  filaProgreso: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10
  },
  porcentaje: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORES.verdeOscuro
  },
  textoSuave: {
    fontSize: 13,
    color: COLORES.textoSuave
  },
  barra: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORES.gris
  },
  lista: {
    flex: 1
  },
  fila: {
    flexDirection: "row",
    alignItems: "stretch"
  },
  lineaTiempo: {
    width: 48,
    alignItems: "center"
  },
  circulo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10
  },
  iconoPaso: {
    width: 20,
    height: 20
  },
  conector: {
    width: 2,
    flex: 1,
    marginVertical: 2
  },
  tarjetaPaso: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginLeft: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }
  },
  tarjetaProceso: {
    borderColor: COLORES.verde
  },
  iconoEstado: {
    resizeMode: "contain"
  },
  insigniaOk: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORES.verde,
    alignItems: "center",
    justifyContent: "center"
  },
  flechaDerecha: {
    width: 20,
    height: 20,
    transform: [{ rotate: "180deg" }]
  },
  puntoPendiente: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORES.gris
  },
  tarjetaError: {
    borderColor: COLORES.error,
    backgroundColor: "#fffafa"
  },
  tituloPaso: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORES.texto
  },
  mensajePaso: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 2
  },
  verDetalle: {
    fontSize: 12,
    color: COLORES.error,
    fontWeight: "600",
    marginTop: 4
  },
  estado: {
    width: 32,
    alignItems: "center",
    marginLeft: 8
  },
  acciones: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12
  },
  boton: {
    flex: 1,
    borderRadius: 12
  },
  botonContorno: {
    borderColor: COLORES.verdeOscuro
  },
});
