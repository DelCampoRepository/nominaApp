import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageSourcePropType,
  BackHandler,
  Animated,
  ScrollView,
  Pressable,
  Alert,
  useWindowDimensions
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { RootStackParamList } from "../../../types/types";
import { useHandleSalir } from "../../../src/hooks/useHandleSalir";
import { useUser } from "../../../src/context/userContext";
import { SeleccionarAvancesEmpleadosASyncronizar } from "../../../src/services/sqlite";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { obtenerFecha } from "../../../src/utils/GenerarFecha";
import { OptionCard } from "../components/OptionCard";

type Props = NativeStackScreenProps<RootStackParamList, "Inicio">;

// Pantallas a las que se navega sin parámetros.
type RutaSinParametros = {
  [K in keyof RootStackParamList]: RootStackParamList[K] extends undefined ? K : never;
}[keyof RootStackParamList];

type Opcion = {
  titulo: string;
  descripcion: string;
  icono: ImageSourcePropType;
  pantalla: RutaSinParametros;
};

const SECCIONES: { titulo: string; opciones: Opcion[] }[] = [
  {
    titulo: "Captura",
    opciones: [
      {
        titulo: "Actividades en lote",
        descripcion: "Asigna actividades al lote",
        icono: require("../../../assets/land-plots.png"),
        pantalla: "ActividadesLote"
      },
      {
        titulo: "Actividades en nave",
        descripcion: "Selecciona actividades por nave",
        icono: require("../../../assets/hoop-housew.png"),
        pantalla: "ActividadesNave"
      },
      {
        titulo: "Registrar empleados",
        descripcion: "Captura empleados por nave",
        icono: require("../../../assets/account-box-edit-outlinew.png"),
        pantalla: "Empleados"
      },
      {
        titulo: "Avances",
        descripcion: "Registra avances por actividad",
        icono: require("../../../assets/chart-line-variantw.png"),
        pantalla: "Avances"
      }
    ]
  },
  {
    titulo: "Consultas",
    opciones: [
      {
        titulo: "Reporte de avances",
        descripcion: "Resumen del día por nave",
        icono: require("../../../assets/file-chart-outlinew.png"),
        pantalla: "ReporteAvances"
      },
      {
        titulo: "Avances jefe de nave",
        descripcion: "Obtén avances del servidor",
        icono: require("../../../assets/account-cowboy-hat.png"),
        pantalla: "Pagos"
      }
    ]
  },
  {
    titulo: "Cuenta",
    opciones: [
      {
        titulo: "Patrón de acceso",
        descripcion: "Entra sin escribir tu contraseña",
        icono: require("../../../assets/pattern.png"),
        pantalla: "ConfigurarPatron"
      }
    ]
  }
];

const COLORES = {
  fondo: "#e5e9f4",
  verde: "#13c044",
  verdeOscuro: "#008445",
  verdeSuave: "#e3f6e9",
  texto: "#1f2933",
  textoSuave: "#6b7280"
};

const MARGEN = 16;
const SEPARACION = 12;

export default function HomeScreen({ navigation }: Props) {
  const { nombreUsuario } = useUser();
  const { HandleSalir } = useHandleSalir();
  const { width } = useWindowDimensions();

  const [semana, setSemana] = useState<string>("");
  const [avancesHoy, setAvancesHoy] = useState<number | null>(null);

  const opacidad = useRef(new Animated.Value(0)).current;
  const desplazamiento = useRef(new Animated.Value(40)).current;

  const columnas = width >= 600 ? 3 : 2;
  // floor: con decimales, el redondeo del layout puede pasar la última
  // tarjeta de cada fila a la siguiente.
  const anchoTarjeta = Math.floor(
    (width - MARGEN * 2 - SEPARACION * (columnas - 1)) / columnas
  );
  const fecha = dayjs().locale("es").format("dddd D [de] MMMM");
  const fechaHoy = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  // Se recalcula cada vez que se vuelve a Inicio (p. ej. después de capturar
  // avances o de sincronizar).
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      (async () => {
        try {
          const semanaActiva = await ConsultarSemanaActiva();
          const avances = await SeleccionarAvancesEmpleadosASyncronizar(
            semanaActiva,
            obtenerFecha()
          );
          if (!activo) return;
          setSemana(String(semanaActiva ?? ""));
          setAvancesHoy(avances.filter((a) => Number(a.avance) !== 0).length);
        } catch {
          if (activo) setAvancesHoy(null);
        }
      })();
      return () => {
        activo = false;
      };
    }, [])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacidad, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(desplazamiento, { toValue: 0, duration: 400, useNativeDriver: true })
    ]).start();
  }, []);

  // Inicio es la raíz después del login: el botón atrás no regresa a
  // Login/Loading. Solo mientras Inicio está en pantalla; si se registrara al
  // montar, seguiría activo debajo de las demás pantallas y bloquearía su botón
  // atrás.
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => backHandler.remove();
    }, [])
  );

  const salir = () => {
    Alert.alert("Cerrar sesión", "¿Desea salir de la aplicación?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: async () => {
          await HandleSalir();
          // reset deja Login como única pantalla: con navigate quedaría encima
          // de Inicio y el botón atrás regresaría a ella.
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        }
      }
    ]);
  };

  const textoAvances =
    avancesHoy === null
      ? "Envía al servidor los avances capturados hoy"
      : avancesHoy === 0
        ? "Aún no hay avances registrados hoy"
        : `${avancesHoy} ${avancesHoy === 1 ? "avance registrado" : "avances registrados"} hoy`;

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <LinearGradient
        colors={[COLORES.verde, COLORES.verdeOscuro]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.encabezado}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.filaEncabezado}>
            <View style={styles.avatar}>
              <Image
                source={require("../../../assets/account.png")}
                style={[styles.iconoImg, { width: 28, height: 28, tintColor: COLORES.verdeOscuro }]}
              />
            </View>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={styles.saludo}>Hola,</Text>
              <Text style={styles.nombre} numberOfLines={1}>
                {nombreUsuario ?? "Usuario"}
              </Text>
            </View>
            <Pressable
              onPress={salir}
              hitSlop={8}
              style={({ pressed }) => [styles.botonSalir, pressed && { opacity: 0.7 }]}
            >
              <Image
                source={require("../../../assets/logout.png")}
                style={[styles.iconoImg, { width: 22, height: 22, tintColor: "#ffffff" }]}
              />
            </Pressable>
          </View>

          <View style={styles.chips}>
            <View style={styles.chip}>
              <Image source={require("../../../assets/calendar-range.png")} style={styles.iconoChip} />
              <Text style={styles.textoChip}>{fechaHoy}</Text>
            </View>
            {!!semana && (
              <View style={styles.chip}>
                <Image source={require("../../../assets/calendar-range.png")} style={styles.iconoChip} />
                <Text style={styles.textoChip}>Semana {semana}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <Animated.View
        style={{ flex: 1, opacity: opacidad, transform: [{ translateY: desplazamiento }] }}
      >
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={() => navigation.navigate("Transferir")}
            style={({ pressed }) => [styles.tarjetaSincronizar, pressed && styles.presionada]}
          >
            <View style={styles.iconoSincronizar}>
              <Image source={require("../../../assets/syncw.png")} style={styles.imagenSincronizar} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tituloSincronizar}>Sincronizar</Text>
              <Text style={styles.textoSincronizar}>{textoAvances}</Text>
            </View>
            <Image
              source={require("../../../assets/arrow-left.png")}
              style={[styles.iconoImg, styles.flechaDerecha, { tintColor: COLORES.verdeOscuro }]}
            />
          </Pressable>

          {SECCIONES.map((seccion) => (
            <View key={seccion.titulo}>
              <Text style={styles.tituloSeccion}>{seccion.titulo}</Text>
              <View style={styles.cuadricula}>
                {seccion.opciones.map((opcion) => (
                  <OptionCard
                    key={opcion.pantalla}
                    titulo={opcion.titulo}
                    descripcion={opcion.descripcion}
                    icono={opcion.icono}
                    ancho={anchoTarjeta}
                    onPress={() => navigation.navigate(opcion.pantalla)}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo
  },
  encabezado: {
    paddingHorizontal: MARGEN,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  filaEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center"
  },
  saludo: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13
  },
  nombre: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700"
  },
  botonSalir: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  // Íconos PNG de assets/: las fuentes de íconos (@expo/vector-icons) no se
  // muestran en la build de la app.
  iconoImg: {
    resizeMode: "contain"
  },
  iconoChip: {
    width: 14,
    height: 14,
    tintColor: "#ffffff",
    resizeMode: "contain"
  },
  flechaDerecha: {
    width: 22,
    height: 22,
    transform: [{ rotate: "180deg" }]
  },
  textoChip: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600"
  },
  contenido: {
    padding: MARGEN,
    paddingBottom: 32
  },
  tarjetaSincronizar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORES.verde,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  presionada: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }]
  },
  iconoSincronizar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORES.verdeOscuro,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  imagenSincronizar: {
    width: 26,
    height: 26,
    tintColor: "#ffffff"
  },
  tituloSincronizar: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORES.texto
  },
  textoSincronizar: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 2
  },
  tituloSeccion: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 24,
    marginBottom: 10
  },
  cuadricula: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SEPARACION
  }
});
