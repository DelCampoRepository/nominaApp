import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, ScrollView } from "react-native";
import React from "react";
import ModalSelector from "../../../src/components/ModalSelector";
import {
  COLORES,
  EncabezadoVerde,
  TarjetaSelectores,
  SelectorPaso,
  AvisoResultado
} from "../../../src/components/PantallaSeleccion";
import { useActividadesLote } from "../hooks/useActividadesLote";
import ContenidoAvances from "../components/ContenidoAvances";
import PieGuardar from "../components/PieGuardar";
import { ICONO_LOTE, ICONO_ACTIVIDAD } from "../utils";

type Props = NativeStackScreenProps<RootStackParamList, "ActividadesLote">;

export default function ActividadesLoteScreen({ navigation }: Props) {
  const {
    lote,
    actividades,
    actividad,
    avances,
    cargandoAvances,
    pendientes,
    guardando,
    aviso,
    modal,
    setModal,
    totalPendientes,
    elegirLote,
    elegirActividad,
    valorActual,
    fijarSeleccion,
    seleccionadosActividad,
    todosSeleccionados,
    guardar,
    regresar,
    opcionesLote,
    opcionesActividad
  } = useActividadesLote(navigation);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoVerde
        titulo="Actividades en lote"
        subtitulo="Marca las actividades que se trabajarán"
        onRegresar={regresar}
      />

      <TarjetaSelectores>
        <SelectorPaso
          paso="1"
          etiqueta="Lote"
          icono={ICONO_LOTE}
          valor={lote}
          placeholder="Seleccionar lote"
          deshabilitado={guardando}
          onPress={() => setModal("lote")}
        />
        <SelectorPaso
          paso="2"
          etiqueta="Actividad"
          icono={ICONO_ACTIVIDAD}
          valor={actividad}
          placeholder={lote ? "Seleccionar actividad" : "Primero elige un lote"}
          deshabilitado={guardando || !lote || actividades.length === 0}
          onPress={() => setModal("actividad")}
        />
      </TarjetaSelectores>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {aviso && <AvisoResultado tipo={aviso.tipo} texto={aviso.texto} />}
        <ContenidoAvances
          lote={lote}
          actividades={actividades}
          actividad={actividad}
          cargandoAvances={cargandoAvances}
          avances={avances}
          pendientes={pendientes}
          guardando={guardando}
          seleccionadosActividad={seleccionadosActividad}
          todosSeleccionados={todosSeleccionados}
          valorActual={valorActual}
          fijarSeleccion={fijarSeleccion}
        />
      </ScrollView>

      {!!lote && (
        <PieGuardar guardando={guardando} totalPendientes={totalPendientes} onGuardar={guardar} />
      )}

      <ModalSelector
        visible={modal === "lote"}
        titulo="Selecciona un lote"
        icono={ICONO_LOTE}
        opciones={opcionesLote}
        seleccionado={lote?.codigo}
        onSeleccionar={elegirLote}
        onCerrar={() => setModal(null)}
      />
      <ModalSelector
        visible={modal === "actividad"}
        titulo="Selecciona una actividad"
        icono={ICONO_ACTIVIDAD}
        opciones={opcionesActividad}
        seleccionado={actividad?.codigo}
        onSeleccionar={elegirActividad}
        onCerrar={() => setModal(null)}
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
  }
});
