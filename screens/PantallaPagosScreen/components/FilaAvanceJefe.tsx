import React from "react";
import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { IAvanceUI } from "../../../src/interfaces/IAvancesNomina";
import { COLORES } from "../../../src/components/PantallaSeleccion";
import { capitalizar, capitalizarNombre, estaMarcado, formatear, jornales } from "../utils";

type Props = {
  avance: IAvanceUI;
  deshabilitado?: boolean;
  onPress: () => void;
};

// Avance que capturó el jefe de nave. Los que ya están en el teléfono no se
// pueden marcar.
export default function FilaAvanceJefe({ avance: a, deshabilitado, onPress }: Props) {
  const guardado = a.existeEnSqlite;
  const marcado = !guardado && estaMarcado(a);
  return (
    <Pressable
      onPress={onPress}
      disabled={guardado || deshabilitado}
      style={({ pressed }) => [
        styles.fila,
        marcado && styles.filaMarcada,
        guardado && styles.filaGuardada,
        pressed && { opacity: 0.85 }
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre} numberOfLines={1}>
          {capitalizarNombre(a.NombreEmpleado)}
        </Text>
        <Text style={styles.detalle} numberOfLines={1}>
          {a.Cod_empleado} · Lote {a.Cod_lote}
          {a.Nom_lote ? ` ${capitalizar(a.Nom_lote)}` : ""}
        </Text>
        <Text style={styles.actividad} numberOfLines={2}>
          <Text style={styles.codigoActividad}>
            {a.Cod_actividad}-{a.Cod_avance}
          </Text>{" "}
          {capitalizar(a.Nom_Actividad)}
        </Text>
        {guardado && (
          <View style={styles.etiqueta}>
            <Image source={require("../../../assets/check-bold.png")} style={styles.iconoEtiqueta} />
            <Text style={styles.textoEtiqueta}>Ya está en el teléfono</Text>
          </View>
        )}
      </View>

      <View style={styles.derecha}>
        <Text style={[styles.avance, guardado && { color: COLORES.textoSuave }]}>{formatear(Number(a.Avance))}</Text>
        <Text style={styles.jornales}>{formatear(jornales(a.Avance, a.Rendimiento))} jorn.</Text>
        {!guardado && (
          <View style={[styles.casilla, marcado && styles.casillaMarcada]}>
            {marcado && <Image source={require("../../../assets/check-bold.png")} style={styles.iconoCasilla} />}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }
  },
  filaMarcada: {
    borderColor: COLORES.verde
  },
  filaGuardada: {
    backgroundColor: "#f6f7fa",
    elevation: 0,
    shadowOpacity: 0
  },
  nombre: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORES.texto
  },
  detalle: {
    fontSize: 12,
    color: COLORES.textoSuave,
    marginTop: 1
  },
  actividad: {
    fontSize: 13,
    color: COLORES.texto,
    marginTop: 4
  },
  codigoActividad: {
    fontWeight: "700",
    color: COLORES.verdeOscuro
  },
  etiqueta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORES.verdeSuave,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6
  },
  iconoEtiqueta: {
    width: 12,
    height: 12,
    tintColor: COLORES.verdeOscuro,
    marginRight: 4,
    resizeMode: "contain"
  },
  textoEtiqueta: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORES.verdeOscuro
  },
  derecha: {
    alignItems: "flex-end",
    marginLeft: 10
  },
  avance: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORES.verdeOscuro
  },
  jornales: {
    fontSize: 11,
    color: COLORES.textoSuave
  },
  casilla: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORES.gris,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6
  },
  casillaMarcada: {
    backgroundColor: COLORES.verde,
    borderColor: COLORES.verde
  },
  iconoCasilla: {
    width: 14,
    height: 14,
    tintColor: "#ffffff",
    resizeMode: "contain"
  }
});
