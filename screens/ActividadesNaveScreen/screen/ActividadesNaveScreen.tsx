import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, ScrollView } from "react-native";
import { ActivityIndicator } from "react-native-paper";
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
import useActividadesNave from "../hooks/useActividadesNave";
import ListaActividades from "../components/ListaActividades";
import SinActividades from "../components/SinActividades";
import PieGuardar from "../components/PieGuardar";
import { ICONO_LOTE, ICONO_NAVE } from "../utils";

type Props = NativeStackScreenProps<RootStackParamList, "ActividadesNave">;

export default function ActividadesNaveScreen({ navigation }: Props) {
  const {
    lote,
    naves,
    nave,
    actividades,
    cargando,
    pendientes,
    guardando,
    aviso,
    modal,
    setModal,
    totalPendientes,
    ocupado,
    elegirLote,
    elegirNave,
    valorActual,
    fijarSeleccion,
    seleccionadas,
    todasSeleccionadas,
    guardar,
    regresar,
    opcionesLote,
    opcionesNave,
    pendientesOtrasNaves
  } = useActividadesNave(navigation);

  const renderContenido = () => {
    if (!lote) {
      return (
        <EstadoVacio
          icono={ICONO_LOTE}
          titulo="Selecciona un lote"
          texto="Elige el lote y la nave para marcar las actividades que se trabajarán hoy."
        />
      );
    }
    if (naves.length === 0) {
      return (
        <EstadoVacio
          icono={ICONO_NAVE}
          titulo="Este lote no tiene naves"
          texto="Sincroniza Naves desde la pantalla Sincronizar e intenta de nuevo."
        />
      );
    }
    if (!nave) {
      return (
        <EstadoVacio
          icono={ICONO_NAVE}
          titulo="Selecciona una nave"
          texto="Elige una nave para ver sus actividades del día."
        />
      );
    }
    if (cargando) {
      return <ActivityIndicator style={{ marginTop: 40 }} color={COLORES.verde} />;
    }
    if (actividades.length === 0) {
      return <SinActividades onIrActividadesLote={() => navigation.navigate("ActividadesLote")} />;
    }
    return (
      <ListaActividades
        actividades={actividades}
        pendientes={pendientes}
        seleccionadas={seleccionadas}
        todasSeleccionadas={todasSeleccionadas}
        ocupado={ocupado}
        valorActual={valorActual}
        fijarSeleccion={fijarSeleccion}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoVerde
        titulo="Actividades en nave"
        subtitulo="Marca las actividades de cada nave para hoy"
        onRegresar={regresar}
      />

      <TarjetaSelectores>
        <SelectorPaso
          paso="1"
          etiqueta="Lote"
          icono={ICONO_LOTE}
          valor={lote}
          placeholder="Seleccionar lote"
          deshabilitado={ocupado}
          onPress={() => setModal("lote")}
        />
        <SelectorPaso
          paso="2"
          etiqueta="Nave"
          icono={ICONO_NAVE}
          valor={nave}
          placeholder={lote ? "Seleccionar nave" : "Primero elige un lote"}
          deshabilitado={ocupado || !lote || naves.length === 0}
          onPress={() => setModal("nave")}
        />
      </TarjetaSelectores>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {aviso && <AvisoResultado tipo={aviso.tipo} texto={aviso.texto} />}
        {renderContenido()}
      </ScrollView>

      {totalPendientes > 0 && (
        <PieGuardar
          totalPendientes={totalPendientes}
          pendientesOtrasNaves={pendientesOtrasNaves}
          guardando={guardando}
          ocupado={ocupado}
          onGuardar={guardar}
        />
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
        visible={modal === "nave"}
        titulo="Selecciona una nave"
        icono={ICONO_NAVE}
        opciones={opcionesNave}
        seleccionado={nave?.codigo}
        onSeleccionar={elegirNave}
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
