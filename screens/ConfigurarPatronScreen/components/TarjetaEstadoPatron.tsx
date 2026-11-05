import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { PatronGuardado } from "../../../src/services/local/patronAcceso";
import { COLORES, TarjetaSelectores } from "../../../src/components/PantallaSeleccion";
import { UsuarioPatron } from "../types";

type Props = {
  patron: PatronGuardado | null;
  cargando: boolean;
  usuario: UsuarioPatron | null;
};

export default function TarjetaEstadoPatron({ patron, cargando, usuario }: Props) {
  return (
    <TarjetaSelectores>
      <View style={styles.estado}>
        <View style={[styles.circuloEstado, { backgroundColor: patron ? COLORES.verdeSuave : COLORES.grisSuave }]}>
          <Image
            source={require("../../../assets/pattern.png")}
            style={[styles.iconoEstado, { tintColor: patron ? COLORES.verdeOscuro : COLORES.textoSuave }]}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tituloEstado}>
            {cargando ? "Consultando…" : patron ? "Patrón activo" : "Sin patrón"}
          </Text>
          <Text style={styles.textoEstado} numberOfLines={2}>
            {usuario ? `Usuario ${usuario.user}${usuario.nombre ? ` · ${usuario.nombre}` : ""}` : "Sin sesión guardada"}
          </Text>
        </View>
      </View>
    </TarjetaSelectores>
  );
}

const styles = StyleSheet.create({
  estado: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10
  },
  circuloEstado: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  iconoEstado: {
    width: 26,
    height: 26,
    resizeMode: "contain"
  },
  tituloEstado: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORES.texto
  },
  textoEstado: {
    fontSize: 13,
    color: COLORES.textoSuave,
    marginTop: 2
  }
});
