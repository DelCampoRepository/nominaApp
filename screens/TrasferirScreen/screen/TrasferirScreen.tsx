import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, View, Pressable, ScrollView, Animated } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../../types/types";
import ModalErrorSincronizacion from "../../../src/components/ModalErrorSincronizacion";
import { DefinicionOpcion } from "../types";
import { COLORES, DESCARGAR, ENVIAR } from "../utils";
import { useTransferir } from "../hooks/useTransferir";
import EncabezadoTransferir from "../components/EncabezadoTransferir";
import TarjetaResumenAvances from "../components/TarjetaResumenAvances";
import AvisoResultado from "../components/AvisoResultado";
import TarjetaOpcion from "../components/TarjetaOpcion";
import PieSincronizar from "../components/PieSincronizar";

type Props = NativeStackScreenProps<RootStackParamList, "Transferir">;

export default function TransferirScreen({ navigation }: Props) {
  const {
    opciones,
    sincronizando,
    setDetalle,
    semana,
    avancesHoy,
    opacidad,
    desplazamiento,
    fechaHoy,
    sincronizar,
    alternar,
    todasDescargas,
    alternarDescargas,
    regresar,
    seleccionadas,
    resumen,
    opcionDetalle,
    infoDetalle,
    textoAvances,
    reintentarDetalle
  } = useTransferir(navigation);

  const renderOpcion = (o: DefinicionOpcion) => (
    <TarjetaOpcion
      key={o.clave}
      definicion={o}
      info={opciones[o.clave]}
      deshabilitada={sincronizando}
      onPress={() => alternar(o.clave)}
      onVerDetalle={() => setDetalle(o.clave)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoTransferir fechaHoy={fechaHoy} semana={semana} onRegresar={regresar} />

      <Animated.View style={{ flex: 1, opacity: opacidad, transform: [{ translateY: desplazamiento }] }}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <TarjetaResumenAvances avancesHoy={avancesHoy} textoAvances={textoAvances} />

          {resumen && <AvisoResultado resumen={resumen} />}

          <Text style={styles.tituloSeccion}>Enviar al servidor</Text>
          {ENVIAR.map(renderOpcion)}

          <View style={styles.filaSeccion}>
            <Text style={[styles.tituloSeccion, { marginTop: 0, marginBottom: 0 }]}>
              Descargar del servidor
            </Text>
            <Pressable onPress={alternarDescargas} disabled={sincronizando} hitSlop={8}>
              <Text style={[styles.enlace, sincronizando && { opacity: 0.4 }]}>
                {todasDescargas ? "Quitar todo" : "Seleccionar todo"}
              </Text>
            </Pressable>
          </View>
          {DESCARGAR.map(renderOpcion)}
        </ScrollView>
      </Animated.View>

      {/* Se envuelve en una función para no pasar el evento como `soloClave`. */}
      <PieSincronizar
        sincronizando={sincronizando}
        seleccionadas={seleccionadas}
        onSincronizar={() => sincronizar()}
      />

      <ModalErrorSincronizacion
        visible={!!infoDetalle?.error}
        titulo={opcionDetalle?.titulo ?? ""}
        mensaje={infoDetalle?.error?.mensaje}
        detalle={infoDetalle?.error?.detalle}
        onCerrar={() => setDetalle(null)}
        onReintentar={reintentarDetalle}
        reintentarDeshabilitado={sincronizando}
      />
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
    paddingBottom: 24
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
  filaSeccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 10
  },
  enlace: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.verdeOscuro
  }
});
