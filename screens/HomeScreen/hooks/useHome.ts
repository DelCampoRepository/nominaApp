import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Animated, Alert, useWindowDimensions } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { RootStackParamList } from "../../../types/types";
import { useHandleSalir } from "../../../src/hooks/useHandleSalir";
import { useUser } from "../../../src/context/userContext";
import { SeleccionarAvancesEmpleadosASyncronizar } from "../../../src/services/sqlite";
import { ConsultarSemanaActiva } from "../../../src/utils/ObtenerSemanaActiva";
import { obtenerFecha } from "../../../src/utils/GenerarFecha";
import { MARGEN, SEPARACION } from "../utils";

type Navegacion = NativeStackNavigationProp<RootStackParamList, "Inicio">;

export function useHome(navigation: Navegacion) {
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

  return {
    nombreUsuario,
    semana,
    fechaHoy,
    textoAvances,
    anchoTarjeta,
    opacidad,
    desplazamiento,
    salir
  };
}
