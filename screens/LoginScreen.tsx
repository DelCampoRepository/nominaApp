import { StyleSheet, View, Image, ImageBackground, Alert } from "react-native";
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  MD2Colors
} from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { AuthContext } from "../src/context/AuthContext";
import { useUser } from "../src/context/userContext";
import { useState, useContext } from "react";
import { useLogin } from "../src/hooks/useLogin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  obtenerSemanaActivaSqLite,
  GuardarDatosUsuario,
  EliminarDatosUsuario,
  SeleccionarDatosUsuario,
  initDB,
  verificarTablas,
  BorraroRegistrosTodasLasTablas,
  limpiarTablaAvances
} from "../src/services/sqlite";
import { eliminarDatos } from "../src/services/local/guardarListaDeEmpleadosEnDbLocal";
import { IdatosEmpleadoNoInternet } from "../src/interfaces/local/IDatosUsuarioNoInternet";
type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { handleLogin, loading, error } = useLogin();

  const [datosUsuario, setDatosUsuario] = useState({
    username: "nomina_sanluis",
    password: "delcampo"
  });
  const { login, logout } = useContext(AuthContext);
  const { setNombreUsuario, setIduUsuario } = useUser();
  const [passVisible, setPassVisible] = useState(false);
  const onSubmit = async () => {
    if (
      datosUsuario.username.trim() === "" ||
      datosUsuario.password.trim() === ""
    ) {
      Alert.alert("Error", "Por favor, ingrese usuario y contraseña");
      return;
    }
    //  await BorraroRegistrosTodasLasTablas();
    //const token = await AsyncStorage.getItem("token");
    if (await initDB()) {
      const datos: IdatosEmpleadoNoInternet[] = await SeleccionarDatosUsuario();
      //await BorraroRegistrosTodasLasTablas();
      if (datos.length > 0) {
        const fechaExpiracion = new Date(datos[0].expiration);

        const fechaActual = new Date();
          console.log("Fecha Expiracion:", fechaExpiracion.toLocaleDateString());
          console.log("Fecha Actual:", fechaActual.toLocaleDateString());
        if (fechaActual.toLocaleDateString() !== fechaExpiracion.toLocaleDateString()) {
            console.log(0)
          Alert.alert(
            "",
            `el dia ha cambiado, se borraran los avances ${fechaActual} > ${fechaExpiracion}`
          );

          await logout();
          const respuesta = await handleLogin({
            nomCorto: datosUsuario.username,
            contra: datosUsuario.password
          });

          if (respuesta?.success) {
            console.log(respuesta);
            await EliminarDatosUsuario();
            await GuardarDatosUsuario({
              estado: respuesta.estado,
              idu_usuario: respuesta.idu_usuario,
              mensaje: respuesta.mensaje,
              nom_usuario: respuesta.nom_usuario,
              semana_actual: respuesta.semana_actual,
              token: respuesta.token.token,
              expiration: respuesta.token.expiration,
              user: respuesta.user
            });

            setNombreUsuario(respuesta.nom_usuario);
            setIduUsuario(respuesta.idu_usuario);
            await login(String(respuesta.token.token));

            navigation.navigate("Loading", {
              nomUsuario: respuesta.nom_usuario,
              semanaActiva: respuesta.semana_actual,
              iduUser: respuesta.idu_usuario
            });
          }
        } else if (datos[0].user !== datosUsuario.username) {
          
          await logout();
          const respuesta = await handleLogin({
            nomCorto: datosUsuario.username,
            contra: datosUsuario.password
          });

          if (respuesta?.success) {
            await EliminarDatosUsuario();
            await GuardarDatosUsuario({
              estado: respuesta.estado,
              idu_usuario: respuesta.idu_usuario,
              mensaje: respuesta.mensaje,
              nom_usuario: respuesta.nom_usuario,
              semana_actual: respuesta.semana_actual,
              token: respuesta.token.token,
              expiration: respuesta.token.expiration,
              user: respuesta.user
            });

            setNombreUsuario(respuesta.nom_usuario);
            setIduUsuario(respuesta.idu_usuario);
            await login(String(respuesta.token.token));

            navigation.navigate("Loading", {
              nomUsuario: respuesta.nom_usuario,
              semanaActiva: respuesta.semana_actual,
              iduUser: respuesta.idu_usuario
            });
          }
          else{
               Alert.alert(
            "Error",
            "No se han encontrado datos sobre este ususario, intente con otro usuario o contraseña."
          );
          return;
          }
        } else {
          console.log("Fecha Expiracion:", fechaExpiracion.toLocaleDateString());
          console.log("Fecha Actual:", fechaActual.toLocaleDateString());
          const semana: any = await obtenerSemanaActivaSqLite();

          setNombreUsuario(datos[0].nom_usuario);
          setIduUsuario(datos[0].idu_usuario);
          navigation.navigate("Inicio");
        }
      } else {
        const respuesta = await handleLogin({
          nomCorto: datosUsuario.username,
          contra: datosUsuario.password
        });

        if (respuesta?.success) {
          await EliminarDatosUsuario();
          await GuardarDatosUsuario({
            estado: respuesta.estado,
            idu_usuario: respuesta.idu_usuario,
            mensaje: respuesta.mensaje,
            nom_usuario: respuesta.nom_usuario,
            semana_actual: respuesta.semana_actual,
            token: respuesta.token.token,
            expiration: respuesta.token.expiration,
            user: respuesta.user
          });

          setNombreUsuario(respuesta.nom_usuario);
          setIduUsuario(respuesta.idu_usuario);
          await login(String(respuesta.token.token));

          navigation.navigate("Loading", {
            nomUsuario: respuesta.nom_usuario,
            semanaActiva: respuesta.semana_actual,
            iduUser: respuesta.idu_usuario
          });
        } else {
          Alert.alert(
            "Error",
            "No se han encontrado datos sobre este ususario, intente con otro usuario o contraseña."
          );
        }
      }
    }
  };

  return (
    <ImageBackground
      source={require("../assets/chat2.png")}
      style={styles.background}
    >
      {loading ? (
        <View
          style={{
            width: "80%",
            height: "60%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e5e9f4d0",
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84
          }}
        >
          <ActivityIndicator animating={true} color={MD2Colors.green800} />
        </View>
      ) : (
        <View
          style={{
            width: "80%",
            height: "60%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e5e9f4d0",
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84
          }}
        >
          <View
            style={{
              width: "100%",
              height: "40%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Image
              style={{ width: 100, height: 100 }}
              source={require("../assets/delcamp.png")}
              resizeMode="center"
            />
          </View>
          <View
            style={{
              width: "100%",
              height: "60%",
              padding: 20
            }}
          >
            <TextInput
              label="Usuario"
              value={datosUsuario.username}
              mode="outlined"
              outlineColor="#008445"
              activeOutlineColor="#008445"
              right={<TextInput.Icon icon={require("../assets/account.png")} />}
              style={{ marginBottom: 15, backgroundColor: "#e5e9f497" }}
              onChangeText={(text: string) =>
                setDatosUsuario((prev) => ({ ...prev, username: text }))
              }
            />
            <TextInput
              label="Contraseña"
              value={datosUsuario.password}
              mode="outlined"
              secureTextEntry={!passVisible}
              outlineColor="#008445"
              activeOutlineColor="#008445"
              right={
                <TextInput.Icon
                  icon={require("../assets/eye.png")}
                  onPress={() => setPassVisible(!passVisible)}
                />
              }
              style={{ marginBottom: 15, backgroundColor: "#e5e9f497" }}
              onChangeText={(text: string) =>
                setDatosUsuario((prev) => ({ ...prev, password: text }))
              }
            />
            <Button mode="contained" buttonColor="#008445" onPress={onSubmit}>
              Ingresar
            </Button>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    marginTop: 23,
    backgroundColor: "#e5e9f4ff"
  },

  centerContainer: {
    width: "70%",
    height: "80%",
    display: "flex"
  },

  logoContainer: {
    width: "100%",
    height: "30%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  logo: {
    width: 120,
    height: 100,
    resizeMode: "contain"
  },

  formularioContainer: {
    width: "100%",
    height: "50%",
    display: "flex",

    justifyContent: "center"
  },

  usuarioContainer: {
    marginTop: 10,
    width: "100%"
  },
  boton: {
    marginTop: 20,
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#008445"
  },
  background: {
    flex: 1,
    resizeMode: "cover", // "cover" se ajusta al tamaño
    justifyContent: "center",
    alignItems: "center"
  },
  content: {
    backgroundColor: "rgba(0,0,0,0.4)", // para contraste
    padding: 20,
    borderRadius: 10
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold"
  }
});
