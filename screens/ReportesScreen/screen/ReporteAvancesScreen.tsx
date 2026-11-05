import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, ScrollView, RefreshControl } from "react-native";
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
import { useReporteAvances } from "../hooks/useReporteAvances";
import TarjetaResumenReporte from "../components/TarjetaResumenReporte";
import SeccionActividad from "../components/SeccionActividad";
import { ICONO_LOTE, ICONO_NAVE, ICONO_REPORTE } from "../utils";

type Props = NativeStackScreenProps<RootStackParamList, "ReporteAvances">;

export default function ReporteAvancesScreen({ navigation }: Props) {
  const r = useReporteAvances();

  const renderContenido = () => {
    if (!r.lote) {
      return (
        <EstadoVacio
          icono={ICONO_LOTE}
          titulo="Selecciona un lote"
          texto="Elige el lote y la nave para ver los avances capturados hoy."
        />
      );
    }
    if (r.naves.length === 0) {
      return (
        <EstadoVacio
          icono={ICONO_NAVE}
          titulo="Este lote no tiene naves"
          texto="Sincroniza Naves desde la pantalla Sincronizar e intenta de nuevo."
        />
      );
    }
    if (!r.nave) {
      return (
        <EstadoVacio icono={ICONO_NAVE} titulo="Selecciona una nave" texto="Elige una nave para ver su reporte del día." />
      );
    }
    if (r.cargando) return <ActivityIndicator style={{ marginTop: 40 }} color={COLORES.verde} />;
    if (r.error) {
      return (
        <View>
          <AvisoResultado tipo="error" texto={r.error} />
          <Button mode="outlined" textColor={COLORES.verdeOscuro} style={styles.botonSecundario} onPress={r.reintentar}>
            Reintentar
          </Button>
        </View>
      );
    }
    if (r.secciones.length === 0) {
      return (
        <View>
          <EstadoVacio
            icono={ICONO_REPORTE}
            titulo="Sin avances hoy"
            texto="Todavía no hay avances capturados en esta nave. Captúralos desde Avances."
          />
          <Button
            mode="outlined"
            textColor={COLORES.verdeOscuro}
            style={styles.botonSecundario}
            onPress={() => navigation.navigate("Avances")}
          >
            Ir a Avances
          </Button>
        </View>
      );
    }
    return (
      <>
        <TarjetaResumenReporte {...r.resumen} />
        <Text style={styles.tituloSeccion}>Actividades · {r.secciones.length}</Text>
        {r.secciones.map((s) => (
          <SeccionActividad key={s.clave} seccion={s} />
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoVerde
        titulo="Reporte de avances"
        subtitulo="Avances capturados hoy por actividad"
        onRegresar={() => navigation.goBack()}
      />

      <TarjetaSelectores>
        <SelectorPaso
          paso="1"
          etiqueta="Lote"
          icono={ICONO_LOTE}
          valor={r.lote}
          placeholder="Seleccionar lote"
          onPress={() => r.setModal("lote")}
        />
        <SelectorPaso
          paso="2"
          etiqueta="Nave"
          icono={ICONO_NAVE}
          valor={r.nave}
          placeholder={r.lote ? "Seleccionar nave" : "Primero elige un lote"}
          deshabilitado={!r.lote || r.naves.length === 0}
          onPress={() => r.setModal("nave")}
        />
      </TarjetaSelectores>

      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        refreshControl={
          r.nave ? (
            <RefreshControl refreshing={r.refrescando} onRefresh={r.refrescar} colors={[COLORES.verde]} />
          ) : undefined
        }
      >
        {renderContenido()}
      </ScrollView>

      <ModalSelector
        visible={r.modal === "lote"}
        titulo="Selecciona un lote"
        icono={ICONO_LOTE}
        opciones={r.opcionesLote}
        seleccionado={r.lote?.codigo}
        onSeleccionar={r.elegirLote}
        onCerrar={() => r.setModal(null)}
      />
      <ModalSelector
        visible={r.modal === "nave"}
        titulo="Selecciona una nave"
        icono={ICONO_NAVE}
        opciones={r.opcionesNave}
        seleccionado={r.nave?.codigo}
        onSeleccionar={r.elegirNave}
        onCerrar={() => r.setModal(null)}
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
    marginBottom: 10
  },
  botonSecundario: {
    alignSelf: "center",
    borderRadius: 12,
    borderColor: COLORES.verdeOscuro
  }
});
