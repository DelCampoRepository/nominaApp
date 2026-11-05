import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { COLORES } from "../../../src/components/PantallaSeleccion";
import { ICONO_ACTIVIDAD, capitalizar, formatear } from "../utils";

type Props = {
  codigo: string;
  nombre: string;
  lote: string;
  nave: string;
  unidad: string;
  rendApli: number;
  rendTop: number;
  totalAvance: number;
  totalJornales: number;
  conAvance: number;
  totalEmpleados: number;
};

// Tarjeta sobre el encabezado: la actividad, dónde se captura, sus
// rendimientos y los totales del día.
export default function TarjetaResumen(p: Props) {
  const unidad = p.unidad ? ` ${p.unidad}` : "";
  return (
    <View style={styles.tarjeta}>
      <View style={styles.fila}>
        <View style={styles.circulo}>
          <Image source={ICONO_ACTIVIDAD} style={styles.icono} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.codigo}>{p.codigo}</Text>
          <Text style={styles.nombre} numberOfLines={2}>
            {capitalizar(p.nombre)}
          </Text>
          <Text style={styles.ubicacion} numberOfLines={1}>
            {p.lote} · {p.nave}
          </Text>
        </View>
      </View>

      <View style={styles.rendimientos}>
        <Text style={styles.chip}>
          Rend. aplicado <Text style={styles.chipValor}>{formatear(Number(p.rendApli))}{unidad}</Text>
        </Text>
        <Text style={styles.chip}>
          Tope <Text style={styles.chipValor}>{formatear(Number(p.rendTop))} jornales</Text>
        </Text>
      </View>

      <View style={styles.totales}>
        <Total etiqueta={`Avance${unidad}`} valor={formatear(p.totalAvance)} />
        <View style={styles.separador} />
        <Total etiqueta="Jornales" valor={formatear(p.totalJornales)} />
        <View style={styles.separador} />
        <Total etiqueta="Con avance" valor={`${p.conAvance}/${p.totalEmpleados}`} />
      </View>
    </View>
  );
}

function Total({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={styles.valorTotal}>{valor}</Text>
      <Text style={styles.etiquetaTotal} numberOfLines={1}>
        {etiqueta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    marginTop: -30,
    marginHorizontal: 16,
    backgroundColor: COLORES.tarjeta,
    borderRadius: 18,
    padding: 14,
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
  circulo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORES.verdeSuave,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  icono: {
    width: 24,
    height: 24,
    tintColor: COLORES.verdeOscuro,
    resizeMode: "contain"
  },
  codigo: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.textoSuave
  },
  nombre: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORES.texto,
    marginTop: 1
  },
  ubicacion: {
    fontSize: 12,
    color: COLORES.textoSuave,
    marginTop: 2
  },
  rendimientos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12
  },
  chip: {
    fontSize: 12,
    color: COLORES.textoSuave,
    backgroundColor: COLORES.grisSuave,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  chipValor: {
    fontWeight: "700",
    color: COLORES.texto
  },
  totales: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORES.verdeSuave
  },
  separador: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#bfe5cb"
  },
  valorTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORES.verdeOscuro
  },
  etiquetaTotal: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 2
  }
});
