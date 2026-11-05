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
  AvisoResultado,
  EstadoVacio
} from "../../../src/components/PantallaSeleccion";
import useRegistroEmpleados from "../hooks/useRegistroEmpleados";
import TarjetaAgregar from "../components/TarjetaAgregar";
import ListaEmpleadosNave from "../components/ListaEmpleadosNave";
import PieAsentar from "../components/PieAsentar";
import { ICONO_EMPLEADO, ICONO_LOTE, ICONO_NAVE } from "../utils";

type Props = NativeStackScreenProps<RootStackParamList, "Empleados">;

export default function EmpleadosScreen({ navigation }: Props) {
  const {
    porAsentar,
    lote,
    nave,
    naves,
    catalogo,
    asentados,
    cargando,
    codigo,
    setCodigo,
    busqueda,
    guardando,
    aviso,
    modal,
    setModal,
    inputRef,
    elegirLote,
    elegirNave,
    agregar,
    agregarCodigoEscrito,
    escanear,
    quitar,
    asentar,
    opcionesLote,
    opcionesNave,
    porAsentarNave,
    porAsentarOtras,
    totalNave
  } = useRegistroEmpleados(navigation);

  const renderContenido = () => {
    if (!lote) {
      return (
        <EstadoVacio
          icono={ICONO_LOTE}
          titulo="Selecciona un lote"
          texto="Elige el lote y la nave donde trabajarán los empleados hoy."
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
          texto="Elige una nave para agregar a sus empleados."
        />
      );
    }
    return (
      <>
        <TarjetaAgregar
          inputRef={inputRef}
          codigo={codigo}
          setCodigo={setCodigo}
          busqueda={busqueda}
          guardando={guardando}
          onAgregar={agregarCodigoEscrito}
          onBuscar={() => setModal("empleado")}
          onEscanear={escanear}
        />
        <ListaEmpleadosNave
          porAsentarNave={porAsentarNave}
          asentados={asentados}
          totalNave={totalNave}
          cargando={cargando}
          guardando={guardando}
          onQuitar={quitar}
        />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoVerde
        titulo="Registro de empleados"
        subtitulo="Asigna los empleados de cada nave para hoy"
        onRegresar={() => navigation.goBack()}
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
          etiqueta="Nave"
          icono={ICONO_NAVE}
          valor={nave}
          placeholder={lote ? "Seleccionar nave" : "Primero elige un lote"}
          deshabilitado={guardando || !lote || naves.length === 0}
          onPress={() => setModal("nave")}
        />
      </TarjetaSelectores>

      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {aviso && <AvisoResultado tipo={aviso.tipo} texto={aviso.texto} />}
        {renderContenido()}
      </ScrollView>

      {porAsentar.length > 0 && (
        <PieAsentar
          totalPorAsentar={porAsentar.length}
          porAsentarOtras={porAsentarOtras}
          guardando={guardando}
          onAsentar={asentar}
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
      <ModalSelector
        visible={modal === "empleado"}
        titulo="Buscar empleado"
        icono={ICONO_EMPLEADO}
        opciones={catalogo}
        onSeleccionar={(o) => {
          setModal(null);
          agregar(o.codigo, o.nombre);
        }}
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
