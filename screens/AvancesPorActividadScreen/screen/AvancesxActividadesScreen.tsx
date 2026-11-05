import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text, ScrollView, Pressable } from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import React from "react";
import { COLORES, EncabezadoVerde, AvisoResultado, EstadoVacio } from "../../../src/components/PantallaSeleccion";
import { useCapturaAvances } from "../hooks/useCapturaAvances";
import TarjetaResumen from "../components/TarjetaResumen";
import FilaAvanceEmpleado from "../components/FilaAvanceEmpleado";
import ModalCapturaAvance from "../components/ModalCapturaAvance";
import { ICONO_EMPLEADO, capitalizar } from "../utils";

type Props = NativeStackScreenProps<RootStackParamList, "AvancesxActividad">;

export default function AvancesxActividadesScreen({ route, navigation }: Props) {
  const p = route.params;
  const c = useCapturaAvances(navigation, p);
  const edicion = c.edicion;

  const renderContenido = () => {
    if (c.cargando) return <ActivityIndicator style={{ marginTop: 40 }} color={COLORES.verde} />;
    if (c.errorCarga) {
      return (
        <View>
          <AvisoResultado tipo="error" texto={c.errorCarga} />
          <Button mode="outlined" textColor={COLORES.verdeOscuro} style={styles.botonSecundario} onPress={c.reintentar}>
            Reintentar
          </Button>
        </View>
      );
    }
    if (c.empleados.length === 0) {
      return (
        <View>
          <EstadoVacio
            icono={ICONO_EMPLEADO}
            titulo="Sin empleados en esta nave"
            texto="Asigna y asienta empleados a la nave en Registro de empleados para capturar sus avances."
          />
          <Button
            mode="outlined"
            textColor={COLORES.verdeOscuro}
            style={styles.botonSecundario}
            onPress={() => navigation.navigate("Empleados")}
          >
            Ir a Registro de empleados
          </Button>
        </View>
      );
    }
    return (
      <>
        <View style={styles.filaSeccion}>
          <Text style={styles.tituloSeccion}>Empleados · {c.empleados.length}</Text>
          <Pressable hitSlop={8} disabled={c.guardando} onPress={() => c.setEdicion({ tipo: "general" })}>
            <Text style={[styles.enlace, c.guardando && { opacity: 0.4 }]}>Avance general</Text>
          </Pressable>
        </View>
        {c.empleados.map((e) => (
          <FilaAvanceEmpleado
            key={e.cod_empleado}
            empleado={e}
            rendApli={p.rendApli}
            unidad={p.unidad}
            modificado={c.modificado(e)}
            deshabilitado={c.guardando}
            onPress={() => c.setEdicion({ tipo: "empleado", empleado: e })}
          />
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <EncabezadoVerde
        titulo="Captura de avances"
        subtitulo="Toca un empleado para escribir su avance"
        onRegresar={() => navigation.goBack()}
      />

      <TarjetaResumen
        codigo={`${p.coAct}-${p.codAv}`}
        nombre={p.nomAct}
        lote={`Lote ${p.lote} ${p.desLote ?? ""}`.trim()}
        nave={`Nave ${p.codNave} ${p.desNave ?? ""}`.trim()}
        unidad={p.unidad}
        rendApli={p.rendApli}
        rendTop={p.redTop}
        totalAvance={c.totalAvance}
        totalJornales={c.totalJornales}
        conAvance={c.conAvance}
        totalEmpleados={c.empleados.length}
      />

      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        {c.aviso && <AvisoResultado tipo={c.aviso.tipo} texto={c.aviso.texto} />}
        {renderContenido()}
      </ScrollView>

      {c.empleados.length > 0 && (
        <View style={styles.pie}>
          <Button
            mode="contained"
            buttonColor={COLORES.verdeOscuro}
            style={styles.botonPrincipal}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontSize: 16, fontWeight: "700" }}
            loading={c.guardando}
            disabled={c.guardando || c.pendientes === 0}
            onPress={c.guardar}
          >
            {c.guardando
              ? "Guardando…"
              : c.pendientes > 0
              ? `Guardar avances (${c.pendientes})`
              : "Sin cambios por guardar"}
          </Button>
        </View>
      )}

      <ModalCapturaAvance
        visible={!!edicion}
        titulo={edicion?.tipo === "general" ? "Avance general" : "Avance del empleado"}
        subtitulo={
          edicion?.tipo === "empleado"
            ? `${edicion.empleado.cod_empleado} · ${capitalizar(edicion.empleado.nom_empleado)}`
            : `Reemplaza el avance de los ${c.empleados.length} empleados de la lista`
        }
        valorInicial={
          edicion?.tipo === "empleado" && Number(edicion.empleado.avanceA || 0) !== 0
            ? String(edicion.empleado.avanceA)
            : ""
        }
        unidad={p.unidad}
        rendApli={p.rendApli}
        rendTop={p.redTop}
        onAsignar={c.asignar}
        onCerrar={() => c.setEdicion(null)}
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
    marginTop: 4,
    marginBottom: 10
  },
  tituloSeccion: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.6
  },
  enlace: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.verdeOscuro
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
