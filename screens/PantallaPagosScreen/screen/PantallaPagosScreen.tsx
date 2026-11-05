import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, ScrollView, Pressable } from "react-native";
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
import { usePagos } from "../hooks/usePagos";
import ResumenConsulta from "../components/ResumenConsulta";
import FiltroNaves from "../components/FiltroNaves";
import FilaAvanceJefe from "../components/FilaAvanceJefe";
import { ICONO_JEFE, ICONO_REPORTE, capitalizar, claveAvance, formatear } from "../utils";

type Props = NativeStackScreenProps<RootStackParamList, "Pagos">;

export default function PatallaPagosScreen({ navigation }: Props) {
  const p = usePagos();

  const renderContenido = () => {
    if (p.cargandoJefes) return <ActivityIndicator style={{ marginTop: 40 }} color={COLORES.verde} />;
    if (p.errorJefes) {
      return (
        <View>
          <AvisoResultado tipo="error" texto={p.errorJefes} />
          <Button mode="outlined" textColor={COLORES.verdeOscuro} style={styles.botonSecundario} onPress={p.reintentarJefes}>
            Reintentar
          </Button>
        </View>
      );
    }
    if (!p.jefe) {
      return (
        <EstadoVacio
          icono={ICONO_JEFE}
          titulo="Selecciona un jefe de nave"
          texto="Se consultarán en el servidor los avances que capturó hoy para guardarlos en el teléfono."
        />
      );
    }
    if (p.consultando) return <ActivityIndicator style={{ marginTop: 40 }} color={COLORES.verde} />;
    if (p.avances === null) {
      return p.aviso ? (
        <Button mode="outlined" textColor={COLORES.verdeOscuro} style={styles.botonSecundario} onPress={p.reconsultar}>
          Reintentar
        </Button>
      ) : null;
    }
    if (p.avances.length === 0) {
      return (
        <View>
          <EstadoVacio
            icono={ICONO_REPORTE}
            titulo="Sin registros hoy"
            texto="El servidor no tiene avances de hoy para este jefe de nave."
          />
          <Button mode="outlined" textColor={COLORES.verdeOscuro} style={styles.botonSecundario} onPress={p.reconsultar}>
            Consultar de nuevo
          </Button>
        </View>
      );
    }
    return (
      <>
        <ResumenConsulta {...p.resumen} />
        <FiltroNaves naves={p.naves} total={p.resumen.registros} seleccionada={p.filtroNave} onCambiar={p.setFiltroNave} />
        {p.grupos.map((g, i) => (
          <View key={g.codigo}>
            <View style={styles.filaSeccion}>
              <Text style={styles.tituloSeccion} numberOfLines={1}>
                Nave {g.codigo}
                {g.nombre ? ` · ${capitalizar(g.nombre)}` : ""}
              </Text>
              {i === 0 && p.hayNuevosVisibles ? (
                <Pressable hitSlop={8} disabled={p.guardando} onPress={p.alternarTodos}>
                  <Text style={[styles.enlace, p.guardando && { opacity: 0.4 }]}>
                    {p.todosMarcados ? "Quitar todo" : "Marcar todo"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.totalNave}>Total avance: {formatear(g.total)}</Text>
            {g.avances.map((a) => (
              <FilaAvanceJefe key={claveAvance(a)} avance={a} deshabilitado={p.guardando} onPress={() => p.alternar(a)} />
            ))}
          </View>
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoVerde
        titulo="Avances jefe de nave"
        subtitulo="Descarga los avances de hoy al teléfono"
        onRegresar={() => navigation.goBack()}
      />

      <TarjetaSelectores>
        <SelectorPaso
          paso="1"
          etiqueta="Jefe de nave"
          icono={ICONO_JEFE}
          valor={p.jefe}
          placeholder={p.cargandoJefes ? "Cargando jefes…" : "Seleccionar jefe de nave"}
          deshabilitado={p.cargandoJefes || p.jefes.length === 0 || p.consultando || p.guardando}
          onPress={() => p.setModalJefes(true)}
        />
      </TarjetaSelectores>

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {p.aviso && <AvisoResultado tipo={p.aviso.tipo} texto={p.aviso.texto} />}
        {renderContenido()}
      </ScrollView>

      {!!p.avances && p.avances.length > 0 && (
        <View style={styles.pie}>
          <Button
            mode="contained"
            buttonColor={COLORES.verdeOscuro}
            style={styles.botonPrincipal}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontSize: 16, fontWeight: "700" }}
            loading={p.guardando}
            disabled={p.guardando || p.porGuardar === 0}
            onPress={p.guardar}
          >
            {p.guardando
              ? "Guardando…"
              : p.porGuardar > 0
              ? `Guardar en el teléfono (${p.porGuardar})`
              : "Nada nuevo marcado"}
          </Button>
        </View>
      )}

      <ModalSelector
        visible={p.modalJefes}
        titulo="Selecciona un jefe de nave"
        icono={ICONO_JEFE}
        opciones={p.jefes}
        seleccionado={p.jefe?.codigo}
        onSeleccionar={p.elegirJefe}
        onCerrar={() => p.setModalJefes(false)}
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
    marginTop: 8
  },
  tituloSeccion: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  totalNave: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORES.verdeOscuro,
    marginTop: 2,
    marginBottom: 8
  },
  enlace: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.verdeOscuro,
    marginLeft: 8
  },
  botonSecundario: {
    alignSelf: "center",
    borderRadius: 12,
    borderColor: COLORES.verdeOscuro
  },
  pie: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: COLORES.fondo
  },
  botonPrincipal: {
    borderRadius: 14
  }
});
