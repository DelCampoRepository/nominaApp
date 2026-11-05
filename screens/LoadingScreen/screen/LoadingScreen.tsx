import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/types";
import { StyleSheet, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ModalErrorSincronizacion from "../../../src/components/ModalErrorSincronizacion";
import { COLORES } from "../utils";
import { useSincronizacionInicial } from "../hooks/useSincronizacionInicial";
import EncabezadoCarga from "../components/EncabezadoCarga";
import TarjetaProgreso from "../components/TarjetaProgreso";
import FilaPaso from "../components/FilaPaso";
import BotonesAccion from "../components/BotonesAccion";

type Props = NativeStackScreenProps<RootStackParamList, "Loading">;

export default function LoadingScreen({ route, navigation }: Props) {
  const { nomUsuario, semanaActiva } = route.params;
  const {
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
  } = useSincronizacionInicial({ navigation, semanaActiva });

  return (
    <SafeAreaView style={styles.container}>
      <EncabezadoCarga titulo={titulo} nomUsuario={nomUsuario} semanaActiva={semanaActiva} />

      <TarjetaProgreso progreso={progreso} terminados={terminados} conError={conError} />

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
        <BotonesAccion
          textoSecundario="Continuar"
          onSecundario={() => navigation.navigate("Inicio")}
          onReintentar={reintentar}
        />
      )}

      {fase === "critico" && (
        <BotonesAccion
          textoSecundario="Ir al login"
          onSecundario={volverAlLogin}
          onReintentar={reintentar}
        />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    paddingHorizontal: 16
  },
  lista: {
    flex: 1
  }
});
