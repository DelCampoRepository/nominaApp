import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { View, StyleSheet, Animated, Easing, Image, Alert } from "react-native";
import {
  Text,
  ActivityIndicator,
  MD2Colors,
  ProgressBar
} from "react-native-paper";
import React, { useContext, useEffect } from "react";
import {
  initDB,
  verificarTablas,
  guardarListaActividadesxLote,
  guardarListaLotesXUsuarioSqLite,
  obtenerSemanaActivaSqLite,
  guardarSemanaActivaSqLite,
  eliminarDatosTablaSemanaActivaSqLite,
  GuardarDatosUsuario,
  SeleccionarDatosUsuario,
  limpiarTablaAvances
} from "../src/services/sqlite";

import { useState } from "react";
import { IRespuestaActividadesxLote } from "../src/interfaces/IRespuestaActividadesxLote";
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

type Props = NativeStackScreenProps<RootStackParamList, "Loading">;
export default function LoadingScreen({ route, navigation }: Props) {
  const { nomUsuario, semanaActiva } = route.params;

  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [iniciar, setIniciar] = useState(0);
  const [resp, setRes] = useState<IRespuestaActividadesxLote[]>([]);
  //const [listaLotes, setListaLotes] = useState<IrespuestaLotesxUsuario[]>([]);
  const { logout } = useContext(AuthContext);
  const { iduUsuario } = useUser();
  const { loading, error, handleTransferenciaCat } = useTransferenciaCat();
  useEffect(() => {
    setIniciar(1);
  }, []);

  useEffect(() => {
    if (iniciar === 1) {
      async function obtener() {
        const respuesta = await obtenerListaDeActividadesPorUsuario({
          idu_usuario: Number(iduUsuario)
        });
        if (respuesta.length === 0) {
          logout();
          navigation.navigate("Login");
        }

        setRes(respuesta);
        // if (respuesta) await guardarListaActividadesxLote(respuesta);
        //const empleadosLocales = await obtenerActividadesxLoteLocales();
        // console.log("📌 Empleados locales:", empleadosLocales);
        setProgress(0.1);
        setProgressText(
          "Consultando lista de actividades por usuario a la base de datos"
        );
      }
      obtener();
    }
  }, [iniciar]);

  useEffect(() => {
    async function iniciarDb() {
      await initDB();

      setProgress(0.2);
      setProgressText("Creando tablas locales");
      //await verificarTablas();

      const semana: any = await obtenerSemanaActivaSqLite();

      if (semana.length === 0 || semana[0].semanaActiva !== semanaActiva) {
        await eliminarDatosTablaSemanaActivaSqLite();
        await guardarSemanaActivaSqLite(semanaActiva);
        await guardarListaActividadesxLote(resp);
        setProgress(0.3);
        setProgressText("Se guardaron la lista de actividades en SqLite");
      } else {
        setProgress(0.3);
      }

      const lista = await obtenerListaLotesxUSuario({
        idu_usuario: Number(iduUsuario)
      });

      if (lista.length == 0)
        Alert.alert("", "No se ha encontrado ninguna tabla para este usuario");

      setProgress(0.4);
      setProgressText("Se obtubieron la lista de lotes desde la base de datos");
      //  await verificarTablas();

      setProgress(0.5);
      await guardarListaLotesXUsuarioSqLite(lista);
      setProgressText("Se agregaron los lotes del usuario a Sqlite");

      const ListaNaves = await obtenerListaNavesxUsuario({
        idu_usuario: Number(iduUsuario)
      });

      if (ListaNaves.length == 0)
        Alert.alert("", "No se ha encontrado ninguna nave para este usuario");

      setProgress(0.6);
      setProgressText("Se obtubieron la lista de naves desde la base de datos");
      //await CrearTablaNavesxUsuario();
      // await verificarTablas();
      await guardarListaNave(ListaNaves);
      setProgress(0.7);
      setProgressText("Se agregaron las naves del usuario a Sqlite");

      const datosUser = await SeleccionarDatosUsuario();
      console.log("📌 Datos del usuario:", datosUser);

      const listaEmpleados = await handleTransferenciaCat({
        wtipo: "1",
        idu_usuario: datosUser[0].idu_usuario
      });

      if (listaEmpleados?.length === 0)
        Alert.alert(
          "",
          "No se ha encontrado ningun empleado para este usuario"
        );

      //await CrearTablaEmpleadosDeServidor();
      await eliminarDatos();
      const insertarEmpleado = await InsertarEmpleadosASQLite(
        listaEmpleados as IRespuestaTransferenciaCat[]
      );

      if (insertarEmpleado) {
        setProgressText("Se agrego lista empleados a  Sqlite");
        setProgress(0.8);
      }

      await verificarTablas();
      await limpiarTablaAvances();
    }

    if (resp.length > 0) {
      iniciarDb();
    }
  }, [resp]);

  useEffect(() => {
    if (progress === 0.8) navigation.navigate("Inicio");
  }, [progress]);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          width: "90%",
          height: "90%",

          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <View style={{ height: 40, marginBottom: 30 }}>
          <ActivityIndicator animating={true} color={MD2Colors.green800} />
        </View>
        <Text variant="bodySmall">Cargando informacion, por favor espere.</Text>
      </View>
      <View style={{ width: "90%", height: "10%" }}>
        <ProgressBar
          color="#03871dff"
          animatedValue={progress}
          visible={true}
          style={{ backgroundColor: "#c3c3c3ff" }}
        />
        <Text variant="bodySmall">{progressText}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    marginTop: 23,
    backgroundColor: "#e5e9f4ff"
  },
  image: {
    width: 50,
    height: 50,
    tintColor:"#13c044"
  }
});
