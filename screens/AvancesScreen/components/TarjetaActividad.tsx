import React from "react";
import { Pressable, View, Text, Image, StyleSheet } from "react-native";
import { IActividadesAvancesSeleccionables } from "../../../src/interfaces/local/iActividadesAvancesSeleccionables";
import { COLORES } from "../../../src/components/PantallaSeleccion";
import { ICONO_ACTIVIDAD, capitalizar } from "../utils";

type Props = {
  actividad: IActividadesAvancesSeleccionables;
  empleadosConAvance: number;
  onPress: () => void;
};

// Actividad de la nave: código, nombre, rendimientos y cuántos empleados ya
// tienen avance hoy. Al tocarla se abre la captura de avances.
export default function TarjetaActividad({ actividad, empleadosConAvance, onPress }: Props) {
  const unidad = actividad.Nom_Corto ? ` ${actividad.Nom_Corto}` : "";
  const conAvance = empleadosConAvance > 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tarjeta, pressed && { opacity: 0.8 }]}>
      <View style={styles.fila}>
        <View style={styles.circulo}>
          <Image source={ICONO_ACTIVIDAD} style={styles.icono} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.codigo}>
            {actividad.cod_actividad}-{actividad.cod_avance}
          </Text>
          <Text style={styles.nombre} numberOfLines={2}>
            {capitalizar(actividad.nom_actividad)}
          </Text>
        </View>
        <Image source={require("../../../assets/arrow-left.png")} style={styles.flecha} />
      </View>

      <View style={styles.datos}>
        <Dato etiqueta="Rend. aplicado" valor={`${actividad.Rendimiento_Aplic ?? "—"}${unidad}`} />
        <View style={styles.separador} />
        <Dato etiqueta="Rend. tope" valor={`${actividad.Rendimiento_Tope ?? "—"}${unidad}`} />
      </View>

      <View style={[styles.etiqueta, conAvance ? styles.etiquetaOk : styles.etiquetaPendiente]}>
        <Text style={[styles.textoEtiqueta, { color: conAvance ? COLORES.verdeOscuro : COLORES.textoSuave }]}>
          {conAvance
            ? `${empleadosConAvance} ${empleadosConAvance === 1 ? "empleado" : "empleados"} con avance hoy`
            : "Sin avances hoy"}
        </Text>
      </View>
    </Pressable>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.etiquetaDato}>{etiqueta}</Text>
      <Text style={styles.valorDato}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
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
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORES.verdeSuave,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  icono: {
    width: 22,
    height: 22,
    tintColor: COLORES.verdeOscuro,
    resizeMode: "contain"
  },
  codigo: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.textoSuave
  },
  nombre: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORES.texto,
    marginTop: 1
  },
  flecha: {
    width: 18,
    height: 18,
    tintColor: COLORES.textoSuave,
    resizeMode: "contain",
    transform: [{ rotate: "180deg" }],
    marginLeft: 8
  },
  datos: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORES.grisSuave
  },
  separador: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: COLORES.gris,
    marginHorizontal: 12
  },
  etiquetaDato: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  valorDato: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORES.texto,
    marginTop: 2
  },
  etiqueta: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 10
  },
  etiquetaOk: {
    backgroundColor: COLORES.verdeSuave
  },
  etiquetaPendiente: {
    backgroundColor: COLORES.grisSuave
  },
  textoEtiqueta: {
    fontSize: 11,
    fontWeight: "700"
  }
});
