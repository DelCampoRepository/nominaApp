import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import React from "react";
import { IEmpleadoCapturado } from "../../../src/interfaces/local/IEmpleadoCapturado";
import { COLORES } from "../../../src/components/PantallaSeleccion";
import { ICONO_ASENTADO, ICONO_EMPLEADO, ICONO_QUITAR, capitalizar, sombra } from "../utils";

export default function FilaEmpleado({
  empleado,
  asentado,
  deshabilitado,
  onQuitar
}: {
  empleado: IEmpleadoCapturado;
  asentado: boolean;
  deshabilitado?: boolean;
  onQuitar?: () => void;
}) {
  return (
    <View style={[styles.fila, !asentado && styles.filaPendiente]}>
      <View style={styles.circuloEmpleado}>
        <Image source={ICONO_EMPLEADO} style={styles.iconoEmpleado} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.codigoEmpleado}>{empleado.cod_empleado}</Text>
        <Text style={styles.nombreEmpleado} numberOfLines={2}>
          {capitalizar(empleado.Nom_empleado)}
        </Text>
        <View style={[styles.etiqueta, asentado ? styles.etiquetaOk : styles.etiquetaPendiente]}>
          {asentado && <Image source={ICONO_ASENTADO} style={styles.iconoEtiqueta} />}
          <Text style={[styles.textoEtiqueta, { color: asentado ? COLORES.verdeOscuro : "#b45309" }]}>
            {asentado ? "Asentado" : "Sin asentar"}
          </Text>
        </View>
      </View>
      {!asentado && onQuitar && (
        <Pressable
          onPress={onQuitar}
          disabled={deshabilitado}
          hitSlop={8}
          style={({ pressed }) => [styles.botonQuitar, (pressed || deshabilitado) && { opacity: 0.5 }]}
        >
          <Image source={ICONO_QUITAR} style={styles.iconoQuitar} />
        </Pressable>
      )}
    </View>
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
    ...sombra
  },
  filaPendiente: {
    borderColor: "#fcd9a8"
  },
  circuloEmpleado: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORES.verdeSuave,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  iconoEmpleado: {
    width: 22,
    height: 22,
    tintColor: COLORES.verdeOscuro,
    resizeMode: "contain"
  },
  codigoEmpleado: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.textoSuave
  },
  nombreEmpleado: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORES.texto,
    marginTop: 1
  },
  etiqueta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6
  },
  etiquetaOk: {
    backgroundColor: COLORES.verdeSuave
  },
  etiquetaPendiente: {
    backgroundColor: "#fef3e2"
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
    fontWeight: "700"
  },
  botonQuitar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORES.errorSuave,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8
  },
  iconoQuitar: {
    width: 16,
    height: 16,
    tintColor: COLORES.error,
    resizeMode: "contain"
  }
});
