import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import { INTENTOS_MAXIMOS_PATRON, PatronGuardado } from "../../../src/services/local/patronAcceso";
import { COLORES } from "../../../src/components/PantallaSeleccion";
import { AccionPatron, Modo, UsuarioPatron } from "../types";

type Props = {
  cargando: boolean;
  usuario: UsuarioPatron | null;
  patron: PatronGuardado | null;
  bloqueado: boolean;
  iniciar: (nuevoModo: Modo, nuevaAccion?: AccionPatron) => void;
};

// Vista "resumen": explicación del patrón y botones para crearlo, cambiarlo
// o eliminarlo.
export default function ResumenPatron({ cargando, usuario, patron, bloqueado, iniciar }: Props) {
  return (
    <>
      <View style={styles.tarjetaInfo}>
        <Text style={styles.textoInfo}>
          Con un patrón puedes entrar a la aplicación sin escribir tu usuario y
          contraseña. Solo funciona en este teléfono y para el usuario con el que
          iniciaste sesión.
        </Text>
        <Text style={[styles.textoInfo, { marginTop: 8 }]}>
          Si inicias sesión con otro usuario, el patrón deja de funcionar y tendrás
          que crear uno nuevo. Por seguridad, después de {INTENTOS_MAXIMOS_PATRON} intentos
          fallidos tendrás que entrar con tu contraseña.
        </Text>
      </View>

      {!cargando && !usuario && (
        <Text style={styles.textoAviso}>
          Inicia sesión con tu usuario y contraseña para poder crear un patrón.
        </Text>
      )}

      {!cargando && !!usuario && (
        <View style={{ gap: 10 }}>
          {patron ? (
            <>
              {bloqueado && (
                <Text style={styles.textoAviso}>
                  El patrón está bloqueado por intentos fallidos. Entra con tu usuario y
                  contraseña para volver a cambiarlo o eliminarlo.
                </Text>
              )}
              <Button
                mode="contained"
                buttonColor={COLORES.verdeOscuro}
                style={styles.boton}
                contentStyle={{ height: 48 }}
                disabled={bloqueado}
                onPress={() => iniciar("actual", "cambiar")}
              >
                Cambiar patrón
              </Button>
              <Button
                mode="outlined"
                textColor={COLORES.error}
                style={[styles.boton, { borderColor: COLORES.error }, bloqueado && { opacity: 0.5 }]}
                contentStyle={{ height: 48 }}
                disabled={bloqueado}
                onPress={() => iniciar("actual", "eliminar")}
              >
                Eliminar patrón
              </Button>
            </>
          ) : (
            <Button
              mode="contained"
              buttonColor={COLORES.verdeOscuro}
              style={styles.boton}
              contentStyle={{ height: 48 }}
              onPress={() => iniciar("nuevo")}
            >
              Crear patrón
            </Button>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tarjetaInfo: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  textoInfo: {
    fontSize: 13,
    color: COLORES.textoSuave,
    lineHeight: 19
  },
  textoAviso: {
    fontSize: 14,
    color: COLORES.texto,
    textAlign: "center",
    marginTop: 8
  },
  boton: {
    borderRadius: 14
  }
});
