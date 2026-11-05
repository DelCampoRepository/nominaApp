import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Props } from "../types";
import { COLORES } from "../utils";
import { useInicioSesion } from "../hooks/useInicioSesion";
import { usePatronLogin } from "../hooks/usePatronLogin";
import EncabezadoMarca from "../components/EncabezadoMarca";
import TarjetaLogin from "../components/TarjetaLogin";
import SeccionPatron from "../components/SeccionPatron";
import ModalPatron from "../components/ModalPatron";

export default function LoginScreen({ navigation }: Props) {
  const {
    datosUsuario,
    passVisible,
    bloqueado,
    iniciarSesion,
    onSubmit,
    cambiarUsuario,
    cambiarPassword,
    alternarPassVisible
  } = useInicioSesion(navigation);
  const { width } = useWindowDimensions();

  const {
    sesionPatron,
    patronBloqueado,
    modalPatron,
    estadoTrazo,
    mensajePatron,
    verificandoPatron,
    abrirPatron,
    cerrarPatron,
    alTerminarPatron
  } = usePatronLogin(iniciarSesion);

  const tamanoPatron = Math.min(width - 96, 280);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORES.verde, COLORES.verdeOscuro]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fondoSuperior}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.contenido}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <EncabezadoMarca />

            <TarjetaLogin
              username={datosUsuario.username}
              password={datosUsuario.password}
              passVisible={passVisible}
              bloqueado={bloqueado}
              onCambiarUsuario={cambiarUsuario}
              onCambiarPassword={cambiarPassword}
              onAlternarPassVisible={alternarPassVisible}
              onSubmit={onSubmit}
            >
              {!!sesionPatron && (
                <SeccionPatron
                  sesionPatron={sesionPatron}
                  patronBloqueado={patronBloqueado}
                  bloqueado={bloqueado}
                  onAbrir={abrirPatron}
                />
              )}
            </TarjetaLogin>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ModalPatron
        visible={modalPatron}
        sesionPatron={sesionPatron}
        estadoTrazo={estadoTrazo}
        mensajePatron={mensajePatron}
        verificandoPatron={verificandoPatron}
        tamanoPatron={tamanoPatron}
        onCerrar={cerrarPatron}
        onTerminar={alTerminarPatron}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo
  },
  fondoSuperior: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32
  },
  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  }
});
