import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { COLORES } from "../utils";

type Props = {
  username: string;
  password: string;
  passVisible: boolean;
  bloqueado: boolean;
  onCambiarUsuario: (text: string) => void;
  onCambiarPassword: (text: string) => void;
  onAlternarPassVisible: () => void;
  onSubmit: () => void;
  // Contenido extra al final de la tarjeta (sección del patrón).
  children?: ReactNode;
};

// Tarjeta blanca con usuario, contraseña y botón Ingresar.
export default function TarjetaLogin({
  username,
  password,
  passVisible,
  bloqueado,
  onCambiarUsuario,
  onCambiarPassword,
  onAlternarPassVisible,
  onSubmit,
  children
}: Props) {
  return (
    <View style={styles.tarjeta}>
      <TextInput
        label="Usuario"
        value={username}
        mode="outlined"
        outlineColor="#d1d5db"
        activeOutlineColor={COLORES.verdeOscuro}
        outlineStyle={{ borderRadius: 12 }}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        disabled={bloqueado}
        left={<TextInput.Icon icon={require("../../../assets/account.png")} color={COLORES.textoSuave} />}
        style={styles.campo}
        onChangeText={onCambiarUsuario}
      />
      <TextInput
        label="Contraseña"
        value={password}
        mode="outlined"
        secureTextEntry={!passVisible}
        outlineColor="#d1d5db"
        activeOutlineColor={COLORES.verdeOscuro}
        outlineStyle={{ borderRadius: 12 }}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        textContentType="password"
        disabled={bloqueado}
        right={
          <TextInput.Icon
            icon={require("../../../assets/eye.png")}
            color={passVisible ? COLORES.verdeOscuro : COLORES.textoSuave}
            onPress={onAlternarPassVisible}
          />
        }
        style={styles.campo}
        onSubmitEditing={onSubmit}
        returnKeyType="go"
        onChangeText={onCambiarPassword}
      />
      <Button
        mode="contained"
        buttonColor={COLORES.verdeOscuro}
        style={styles.botonPrincipal}
        contentStyle={{ height: 50 }}
        labelStyle={{ fontSize: 16, fontWeight: "700" }}
        onPress={onSubmit}
        disabled={bloqueado}
        loading={bloqueado}
      >
        {bloqueado ? "Ingresando…" : "Ingresar"}
      </Button>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }
  },
  campo: {
    marginBottom: 14,
    backgroundColor: "#ffffff"
  },
  botonPrincipal: {
    borderRadius: 14,
    marginTop: 4
  }
});
