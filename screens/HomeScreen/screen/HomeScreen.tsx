import React from "react";
import { StyleSheet, Animated, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../../types/types";
import { useHome } from "../hooks/useHome";
import { COLORES, MARGEN, SECCIONES } from "../utils";
import { EncabezadoInicio } from "../components/EncabezadoInicio";
import { TarjetaSincronizar } from "../components/TarjetaSincronizar";
import { SeccionOpciones } from "../components/SeccionOpciones";

type Props = NativeStackScreenProps<RootStackParamList, "Inicio">;

export default function HomeScreen({ navigation }: Props) {
  const {
    nombreUsuario,
    semana,
    fechaHoy,
    textoAvances,
    anchoTarjeta,
    opacidad,
    desplazamiento,
    salir
  } = useHome(navigation);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoInicio
        nombreUsuario={nombreUsuario}
        fechaHoy={fechaHoy}
        semana={semana}
        onSalir={salir}
      />

      <Animated.View
        style={{ flex: 1, opacity: opacidad, transform: [{ translateY: desplazamiento }] }}
      >
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <TarjetaSincronizar
            textoAvances={textoAvances}
            onPress={() => navigation.navigate("Transferir")}
          />

          {SECCIONES.map((seccion) => (
            <SeccionOpciones
              key={seccion.titulo}
              seccion={seccion}
              anchoTarjeta={anchoTarjeta}
              onSeleccionar={(opcion) => navigation.navigate(opcion.pantalla)}
            />
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
  contenido: {
    padding: MARGEN,
    paddingBottom: 32
  }
});
