import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORES } from "../../../src/components/PantallaSeleccion";

type Props = {
  registros: number;
  empleados: number;
  sincronizados: number;
  pendientes: number;
};

// Totales del día de la nave: registros, empleados y estado de sincronización.
export default function TarjetaResumenReporte({ registros, empleados, sincronizados, pendientes }: Props) {
  const porcentaje = registros > 0 ? sincronizados / registros : 0;
  return (
    <View style={styles.tarjeta}>
      <View style={styles.fila}>
        <Dato valor={registros} etiqueta="Registros" />
        <View style={styles.separador} />
        <Dato valor={empleados} etiqueta="Empleados" />
        <View style={styles.separador} />
        <Dato valor={sincronizados} etiqueta="Sincronizados" color={COLORES.verdeOscuro} />
        <View style={styles.separador} />
        <Dato valor={pendientes} etiqueta="Pendientes" color={pendientes > 0 ? "#b45309" : COLORES.texto} />
      </View>
      <View style={styles.barra}>
        <View style={[styles.relleno, { flex: porcentaje }]} />
        <View style={{ flex: 1 - porcentaje }} />
      </View>
      <Text style={styles.nota}>
        {pendientes === 0
          ? "Todos los registros están sincronizados."
          : `${pendientes} ${pendientes === 1 ? "registro falta" : "registros faltan"} por sincronizar. Envíalos desde Sincronizar.`}
      </Text>
    </View>
  );
}

function Dato({ valor, etiqueta, color = COLORES.texto }: { valor: number; etiqueta: string; color?: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={[styles.valor, { color }]}>{valor}</Text>
      <Text style={styles.etiqueta} numberOfLines={1}>
        {etiqueta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  fila: {
    flexDirection: "row",
    alignItems: "center"
  },
  separador: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: COLORES.grisSuave
  },
  valor: {
    fontSize: 20,
    fontWeight: "800"
  },
  etiqueta: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 2
  },
  barra: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: COLORES.grisSuave,
    marginTop: 14
  },
  relleno: {
    backgroundColor: COLORES.verde
  },
  nota: {
    fontSize: 12,
    color: COLORES.textoSuave,
    marginTop: 8
  }
});
