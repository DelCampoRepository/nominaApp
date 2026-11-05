import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import React from "react";
import ModalSelector from "../../../src/components/ModalSelector";
import {
  COLORES,
  EncabezadoVerde,
  TarjetaSelectores,
  SelectorPaso,
  AvisoResultado,
  EstadoVacio
} from "../../../src/components/PantallaSeleccion";
import { useAvances } from "../hooks/useAvances";
import TarjetaActividad from "../components/TarjetaActividad";
import { ICONO_ACTIVIDAD, ICONO_LOTE, ICONO_NAVE, claveActividad } from "../utils";

type Props = NativeStackScreenProps<RootStackParamList, "Avances">;

export default function AvancesScreen({ navigation }: Props) {
  const a = useAvances(navigation);

  const totalConAvance = a.actividades.filter((x) => (a.conteos[claveActividad(x)] ?? 0) > 0).length;

  const renderContenido = () => {
    if (!a.lote) {
      return (
        <EstadoVacio
          icono={ICONO_LOTE}
          titulo="Selecciona un lote"
          texto="Elige el lote y la nave para ver las actividades del día y capturar sus avances."
        />
      );
    }
    if (a.naves.length === 0) {
      return (
        <EstadoVacio
          icono={ICONO_NAVE}
          titulo="Este lote no tiene naves"
          texto="Sincroniza Naves desde la pantalla Sincronizar e intenta de nuevo."
        />
      );
    }
    if (!a.nave) {
      return (
        <EstadoVacio
          icono={ICONO_NAVE}
          titulo="Selecciona una nave"
          texto="Elige una nave para ver sus actividades del día."
        />
      );
    }
    if (a.cargando) {
      return <ActivityIndicator style={{ marginTop: 40 }} color={COLORES.verde} />;
    }
    if (a.error) {
      return (
        <View>
          <AvisoResultado tipo="error" texto={a.error} />
          <Button mode="outlined" textColor={COLORES.verdeOscuro} style={styles.botonSecundario} onPress={a.reintentar}>
            Reintentar
          </Button>
        </View>
      );
    }
    if (a.actividades.length === 0) {
      return (
        <View>
          <EstadoVacio
            icono={ICONO_ACTIVIDAD}
            titulo="Sin actividades para hoy"
            texto="Esta nave no tiene actividades marcadas hoy. Márcalas en Actividades en nave para capturar sus avances."
          />
          <Button
            mode="outlined"
            textColor={COLORES.verdeOscuro}
            style={styles.botonSecundario}
            onPress={() => navigation.navigate("ActividadesNave")}
          >
            Ir a Actividades en nave
          </Button>
        </View>
      );
    }
    return (
      <>
        <View style={styles.filaSeccion}>
          <Text style={styles.tituloSeccion}>Actividades · {a.actividades.length}</Text>
          <Text style={styles.notaSeccion}>
            {totalConAvance} de {a.actividades.length} con avance
          </Text>
        </View>
        {a.actividades.map((x) => (
          <TarjetaActividad
            key={`${x.cod_actividad}-${x.cod_avance}-${x.nom_actividad}`}
            actividad={x}
            empleadosConAvance={a.conteos[claveActividad(x)] ?? 0}
            onPress={() => a.abrirActividad(x)}
          />
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoVerde
        titulo="Avances"
        subtitulo="Elige una actividad para capturar los avances de hoy"
        onRegresar={() => navigation.goBack()}
      />

      <TarjetaSelectores>
        <SelectorPaso
          paso="1"
          etiqueta="Lote"
          icono={ICONO_LOTE}
          valor={a.lote}
          placeholder="Seleccionar lote"
          onPress={() => a.setModal("lote")}
        />
        <SelectorPaso
          paso="2"
          etiqueta="Nave"
          icono={ICONO_NAVE}
          valor={a.nave}
          placeholder={a.lote ? "Seleccionar nave" : "Primero elige un lote"}
          deshabilitado={!a.lote || a.naves.length === 0}
          onPress={() => a.setModal("nave")}
        />
      </TarjetaSelectores>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {renderContenido()}
      </ScrollView>

      <ModalSelector
        visible={a.modal === "lote"}
        titulo="Selecciona un lote"
        icono={ICONO_LOTE}
        opciones={a.opcionesLote}
        seleccionado={a.lote?.codigo}
        onSeleccionar={a.elegirLote}
        onCerrar={() => a.setModal(null)}
      />
      <ModalSelector
        visible={a.modal === "nave"}
        titulo="Selecciona una nave"
        icono={ICONO_NAVE}
        opciones={a.opcionesNave}
        seleccionado={a.nave?.codigo}
        onSeleccionar={a.elegirNave}
        onCerrar={() => a.setModal(null)}
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
  filaSeccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 10
  },
  tituloSeccion: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  notaSeccion: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.verdeOscuro
  },
  botonSecundario: {
    alignSelf: "center",
    borderRadius: 12,
    borderColor: COLORES.verdeOscuro
  }
});
