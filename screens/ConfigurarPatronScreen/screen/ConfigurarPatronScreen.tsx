import React from "react";
import { StyleSheet, ScrollView, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import {
  COLORES,
  EncabezadoVerde,
  AvisoResultado
} from "../../../src/components/PantallaSeleccion";
import { useConfigurarPatron } from "../hooks/useConfigurarPatron";
import TarjetaEstadoPatron from "../components/TarjetaEstadoPatron";
import ResumenPatron from "../components/ResumenPatron";
import ZonaPatron from "../components/ZonaPatron";

type Props = NativeStackScreenProps<RootStackParamList, "ConfigurarPatron">;

export default function ConfigurarPatronScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const tamanoPatron = Math.min(width - 64, 300);

  const {
    usuario,
    patron,
    cargando,
    modo,
    estadoTrazo,
    mensaje,
    mensajeError,
    aviso,
    ocupado,
    bloqueado,
    titulos,
    iniciar,
    cancelar,
    alTerminarTrazo
  } = useConfigurarPatron();

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoVerde
        titulo="Patrón de acceso"
        subtitulo="Entra sin escribir tu contraseña"
        onRegresar={() => navigation.goBack()}
      />

      <TarjetaEstadoPatron patron={patron} cargando={cargando} usuario={usuario} />

      <ScrollView contentContainerStyle={styles.contenido} scrollEnabled={modo === "resumen"}>
        {aviso && <AvisoResultado tipo={aviso.tipo} texto={aviso.texto} />}

        {modo === "resumen" ? (
          <ResumenPatron
            cargando={cargando}
            usuario={usuario}
            patron={patron}
            bloqueado={bloqueado}
            iniciar={iniciar}
          />
        ) : (
          <ZonaPatron
            titulo={titulos[modo]}
            mensaje={mensaje}
            mensajeError={mensajeError}
            tamanoPatron={tamanoPatron}
            estadoTrazo={estadoTrazo}
            ocupado={ocupado}
            onTerminar={alTerminarTrazo}
            onCancelar={cancelar}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo
  },
  contenido: {
    padding: 16,
    paddingBottom: 32
  }
});
