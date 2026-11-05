import { StyleSheet, View, Text, Image, TextInput } from "react-native";
import { Button, ActivityIndicator } from "react-native-paper";
import React, { RefObject } from "react";
import { COLORES } from "../../../src/components/PantallaSeleccion";
import { Busqueda, ICONO_BUSCAR, ICONO_EMPLEADO, ICONO_QR, LARGO_CODIGO, sombra } from "../utils";
import BotonIcono from "./BotonIcono";

type Props = {
  inputRef: RefObject<TextInput | null>;
  codigo: string;
  setCodigo: (codigo: string) => void;
  busqueda: Busqueda;
  guardando: boolean;
  onAgregar: () => void;
  onBuscar: () => void;
  onEscanear: () => void;
};

export default function TarjetaAgregar({
  inputRef,
  codigo,
  setCodigo,
  busqueda,
  guardando,
  onAgregar,
  onBuscar,
  onEscanear
}: Props) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.tituloTarjeta}>Agregar empleado</Text>
      <View style={styles.filaAgregar}>
        <TextInput
          ref={inputRef}
          value={codigo}
          onChangeText={(t) => setCodigo(t.replace(/\D/g, ""))}
          onSubmitEditing={onAgregar}
          placeholder="Código (6 dígitos)"
          placeholderTextColor={COLORES.textoSuave}
          keyboardType="number-pad"
          maxLength={LARGO_CODIGO}
          style={styles.inputCodigo}
          returnKeyType="done"
        />
        <BotonIcono icono={ICONO_BUSCAR} onPress={onBuscar} />
        <BotonIcono icono={ICONO_QR} onPress={onEscanear} />
      </View>

      {busqueda.estado === "buscando" && (
        <ActivityIndicator style={{ marginTop: 12 }} color={COLORES.verde} />
      )}
      {busqueda.estado === "noEncontrado" && (
        <Text style={styles.textoNoEncontrado}>
          No se encontró el empleado {busqueda.codigo}. Verifica el código o sincroniza Empleados.
        </Text>
      )}
      {busqueda.estado === "encontrado" && (
        <View style={styles.resultado}>
          <View style={styles.circuloEmpleado}>
            <Image source={ICONO_EMPLEADO} style={styles.iconoEmpleado} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.codigoEmpleado}>{busqueda.codigo}</Text>
            <Text style={styles.nombreEmpleado} numberOfLines={2}>
              {busqueda.nombre}
            </Text>
          </View>
          <Button
            mode="contained"
            buttonColor={COLORES.verdeOscuro}
            style={{ borderRadius: 12 }}
            onPress={onAgregar}
            disabled={guardando}
          >
            Agregar
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 18,
    padding: 14,
    ...sombra
  },
  tituloTarjeta: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.textoSuave,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10
  },
  filaAgregar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  inputCodigo: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORES.grisSuave,
    paddingHorizontal: 14,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 2,
    color: COLORES.texto
  },
  textoNoEncontrado: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: COLORES.error
  },
  resultado: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#f7fdf9",
    borderWidth: 1,
    borderColor: COLORES.verdeSuave
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
  }
});
