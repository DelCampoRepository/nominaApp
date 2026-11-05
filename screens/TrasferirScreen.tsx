import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRef, useEffect } from "react";
import { RootStackParamList } from "../types/types";
import { obtenerListaLotesxUSuario } from "../src/services/ObtenerLotesxUsuario";
import Header from "../src/components/Header";
import { obtenerListaNavesxUsuario } from "../src/services/ObtenerNavesxUsuario";
import { guardarListaNave } from "../src/services/local/guardarListaDeNavesEnDbLocal";
import { useTransferenciaCat } from "../src/hooks/useTransferenciaCat";
import { GuardarAvancesEnDb } from "../src/services/GuardarAvancesAAsenar";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Animated,
  ImageSourcePropType,
  Alert
} from "react-native";
import {
  Text,
  TextInput,
  IconButton,
  Appbar,
  DataTable,
  Checkbox,
  Avatar,
  Button,
  ActivityIndicator,
  MD2Colors
} from "react-native-paper";
import React, { useState } from "react";
import {
  guardarListaLotesXUsuarioSqLite,
  guardarListaActividadesxLote,
  SeleccionarAvancesEmpleadosASyncronizar,
  obtenerSemanaActivaSqLite,
  ActualizarAvancesSincro,
  Seleccionarllenado,
  SeleccionarDatosUsuario,
  guardarListajefesNave
} from "../src/services/sqlite";
import { SafeAreaView } from "react-native-safe-area-context";
import { IRespuestaTransferenciaCat } from "../src/interfaces/IRespuestaTransferenciaCat1";
import { IWDatos } from "../src/interfaces/IEmpleadosParaAsentar";
import { IEmpleadosParaAsentar } from "../src/interfaces/IEmpleadosParaAsentar";
import { IAvanceEmpleado } from "../src/interfaces/local/IAvanceEmpleado";
import {
  InsertarEmpleadosASQLite,
  eliminarDatos
} from "../src/services/local/guardarListaDeEmpleadosEnDbLocal";
type Props = NativeStackScreenProps<RootStackParamList, "Transferir">;
import { obtenerListaDeActividadesPorUsuario } from "../src/services/ObtenerActividadesxLote";
import { useUser } from "../src/context/userContext";
import dayjs from "dayjs";
import { obtenerJefesNave } from "../src/services/ObtenerJefesNave";
import { avisarSinInternet, hayInternet } from "../src/utils/conexion";
type ListaOpciones = {
  key: number;
  label: string;
  estado: boolean;
};

type boton = {
  index: number;
  nombre: string;
  selec: number;
  sincro: boolean;
  icono: ImageSourcePropType;
};
export default function TransferirScreen({ navigation }: Props) {
  const fadeAnimInputs = useRef(new Animated.Value(0)).current;
  const translateYInputs = useRef(new Animated.Value(200)).current;
  const { iduUsuario } = useUser();
  const [AvancesEmpleado, setAvancesEmpleado] = useState<IAvanceEmpleado[]>([]);
  const [listaParaAsentar, setListaParaAsentar] =
    useState<IEmpleadosParaAsentar>();
  const [wDatosAsentar, setWdatosAsentar] = useState<IWDatos[]>([]);
  const { loading, error, handleTransferenciaCat } = useTransferenciaCat();
  const [botones, setBotones] = useState([
    {
      index: 1,
      nombre: "Lotes",
      selec: 0,
      sincro: false,
      icono: require("../assets/land-fields.png")
    },
    {
      nombre: "Naves",
      index: 2,
      selec: 0,
      sincro: false,
      icono: require("../assets/hoop-house.png")
    },
    {
      nombre: "Empleados",
      index: 3,
      selec: 0,
      sincro: false,
      icono: require("../assets/account.png")
    },
    {
      nombre: "Actividades",
      index: 4,
      selec: 0,
      sincro: false,
      icono: require("../assets/sprout.png")
    },
    {
      nombre: "Jefes de naves",
      index: 6,
      selec: 0,
      sincro: false,
      icono: require("../assets/account-cowboy-hat.png")
    },
    {
      nombre: "Avances",
      index: 5,
      selec: 1,
      sincro: false,
      icono: require("../assets/chart-line-variant.png")
    }
  ]);
  const fecha = dayjs().format("YYYY-MM-DD");
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimInputs, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(translateYInputs, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  useEffect(() => {}, [botones]);
  useEffect(() => {
    if (wDatosAsentar.length !== 0) {
      setListaParaAsentar({
        cod_lote: "",
        cod_nave: "",
        wDatos: wDatosAsentar
      });
    }
  }, [wDatosAsentar]);

  // Quita el indicador de carga de un boton cuando su sincronizacion se corta.
  const detenerIndicador = (index: number) =>
    setBotones((prev) =>
      prev.map((b) => (b.index === index ? { ...b, sincro: false } : b))
    );

  const handleActualizar = async () => {
    // Todas las opciones llaman a la API: sin internet se avisa una vez y no
    // se intenta ninguna.
    if (!(await hayInternet())) {
      avisarSinInternet();
      return;
    }

    for (const botonSele of botones) {
      console.log("rrr");
      if (botonSele.selec === 1) {
        setBotones((prev) =>
          prev.map((b) =>
            b.index === botonSele.index
              ? { ...b, sincro: b.sincro === false ? true : false }
              : b
          )
        );

        switch (botonSele.index) {
          case 1:
            const lista = await obtenerListaLotesxUSuario({
              idu_usuario: Number(iduUsuario)
            });

            if (lista.length == 0)
              Alert.alert(
                "",
                "No se ha encontrado ninguna tabla para este usuario"
              );

            const ValidaGuardadoLotes = await guardarListaLotesXUsuarioSqLite(
              lista
            );
            if (ValidaGuardadoLotes) {
              Alert.alert("", "Lotes sincronizados");
              setBotones((prev) =>
                prev.map((b) =>
                  b.index === botonSele.index
                    ? { ...b, sincro: b.sincro === true ? false : true }
                    : b
                )
              );
            } else {
              Alert.alert("Error", "No se pudo actualizar lista de lotes");
              setBotones((prev) =>
                prev.map((b) =>
                  b.index === botonSele.index
                    ? { ...b, selec: b.selec === 1 ? 0 : 1 }
                    : b
                )
              );
            }

            break;
          case 2:
            const ListaNaves = await obtenerListaNavesxUsuario({
              idu_usuario: Number(iduUsuario)
            });

            if (ListaNaves.length === 0) {
              Alert.alert(
                "",
                "No se ha encontrado ninguna nave para este usuario"
              );
              // continue y no return: las demas opciones seleccionadas
              // (p. ej. Avances) se siguen sincronizando.
              detenerIndicador(botonSele.index);
              continue;
            }

            const ValidaGuardadoNaves = await guardarListaNave(ListaNaves);
            if (ValidaGuardadoNaves) {
              Alert.alert("", "Naves sincronizadas");
              setBotones((prev) =>
                prev.map((b) =>
                  b.index === botonSele.index
                    ? { ...b, sincro: b.sincro === true ? false : true }
                    : b
                )
              );
            } else {
              Alert.alert("Error", "No se pudo actualizar lista de lotes");
              setBotones((prev) =>
                prev.map((b) =>
                  b.index === botonSele.index
                    ? { ...b, selec: b.selec === 1 ? 0 : 1 }
                    : b
                )
              );
            }

            break;
          case 3:
            const datosUser = await SeleccionarDatosUsuario();
            const listaEmpleados = await handleTransferenciaCat({
              wtipo: "1",
              idu_usuario: datosUser[0].idu_usuario
            });
            console.log("📌 listaEmpleados:", listaEmpleados);
            if (!listaEmpleados || listaEmpleados.length === 0) {
              Alert.alert(
                "",
                "No se ha encontrado ningun empleado para este usuario"
              );
              // No se borra la lista local si no llego una nueva (p. ej. se
              // perdio la señal durante la peticion).
              detenerIndicador(botonSele.index);
              continue;
            }

            await eliminarDatos();

            const ValidaGuardadoEmpleados = await InsertarEmpleadosASQLite(
              listaEmpleados as IRespuestaTransferenciaCat[]
            );
            if (ValidaGuardadoEmpleados) {
              Alert.alert("", "Empleados sincronizados");
              setBotones((prev) =>
                prev.map((b) =>
                  b.index === botonSele.index
                    ? { ...b, sincro: b.sincro === true ? false : true }
                    : b
                )
              );
            } else {
              Alert.alert("Error", "No se pudo actualizar lista de empleados");
              setBotones((prev) =>
                prev.map((b) =>
                  b.index === botonSele.index
                    ? { ...b, selec: b.selec === 1 ? 0 : 1 }
                    : b
                )
              );
            }

            break;
          case 4:
            const respuesta = await obtenerListaDeActividadesPorUsuario({
              idu_usuario: Number(iduUsuario)
            });
            if (respuesta.length === 0) {
            }

            const validaGuardaActividades = await guardarListaActividadesxLote(
              respuesta
            );
            if (validaGuardaActividades) {
              Alert.alert("", "Actividades sincronizadas");

              setBotones((prev) =>
                prev.map((b) =>
                  b.index === botonSele.index
                    ? { ...b, sincro: b.sincro === true ? false : true }
                    : b
                )
              );
            } else {
              Alert.alert(
                "Error",
                "No se pudo actualizar lista de actividades"
              );
              setBotones((prev) =>
                prev.map((b) =>
                  b.index === botonSele.index
                    ? { ...b, selec: b.selec === 1 ? 0 : 1 }
                    : b
                )
              );
            }
            break;
          case 5:
            const semana: any = await obtenerSemanaActivaSqLite();
            // console.log("semana", semana[0].semanaActiva);
            const listaAsentar = await SeleccionarAvancesEmpleadosASyncronizar(
              semana[0].semanaActiva,
              fecha
            );

            if (listaAsentar.length === 0) {
              Alert.alert("Error", "No hay empleados con avances para asentar");
              detenerIndicador(botonSele.index);
              continue;
            } else {
              //creamos un nuevo arreglo vacio de nombre lotesMap de tipo IEmpleadosParaAsentar
              const lotesMap = new Map<string, IEmpleadosParaAsentar>();

              //por cada empleado en la lista
              for (const empleado of listaAsentar) {
                //tomamos el lote y nave de ese  empleado
                const { cod_lote, cod_nave } = empleado;

                const key = `${cod_lote}_${cod_nave}`;
                //si el lote del empleado interado  no existe dentro de lotesMap
                if (!lotesMap.has(key)) {
                  lotesMap.set(key, {
                    cod_lote,
                    cod_nave,
                    wDatos: []
                  });
                }

                // console.log(JSON.stringify(lotesMap, null, 2));

                const lote = lotesMap.get(key)!;

                lote.wDatos.push({
                  cod_act: empleado.cod_actividad,
                  cod_avn: empleado.cod_avance,
                  cod_emp: empleado.cod_empleado,
                  avances: empleado.avance,
                  avancesA: empleado.avanceA,
                  bandera: "",
                  rendAplicado: empleado.Rendimiento_Aplic,
                  estadoSincro: empleado.estadoSincro,
                  MensajeSincro: empleado.MensajeSincro
                });
              }

              const lotes: IEmpleadosParaAsentar[] = Array.from(
                lotesMap.values()
              );

              const data = { lotes };
              console.log("asasasa", JSON.stringify(data, null, 2));
              //console.log(JSON.stringify(data.lotes, null, 2));
              try {
                const res: any = await GuardarAvancesEnDb(data.lotes);

                // GuardarAvancesEnDb devuelve [] si no se pudo sincronizar
                // (sin internet, sin respuesta o error del servidor) y ya
                // mostro el aviso correspondiente.
                if (Array.isArray(res) && res.length > 0) {
                  for (const item of res) {
                    const { cod_lote, cod_nave, wDatos } = item ?? {};
                    if (!Array.isArray(wDatos)) continue;

                    for (const empleado of wDatos) {
                      const { cod_act, cod_avn, cod_emp } = empleado;

                      // El servidor puede devolver el campo en camelCase o
                      // PascalCase; nunca se manda undefined a SQLite.
                      await ActualizarAvancesSincro({
                        estadoSincro: empleado.estadoSincro ?? 0,
                        MensajeSincro:
                          empleado.mensajeSincro ?? empleado.MensajeSincro ?? "",
                        cod_actividad: cod_act,
                        cod_avance: cod_avn,
                        cod_lote: cod_lote,
                        cod_nave: cod_nave,
                        cod_empleado: cod_emp,
                        semanaActiva: semana[0].semanaActiva,
                        fecha: fecha
                      } as IAvanceEmpleado);
                    }
                  }
                  Alert.alert(
                    "",
                    "Se han sincronizado y guardado los datos en el dispositivo"
                  );
                } else {
                  Alert.alert(
                    "Error",
                    "No se pudieron enviar los avances. Los registros siguen guardados en el dispositivo; intente de nuevo."
                  );
                }
              } catch (error: any) {
                console.log("Error al sincronizar avances:", error?.message);
                Alert.alert(
                  "Error",
                  "Ocurrió un problema al sincronizar los avances. Los registros siguen guardados en el dispositivo; intente de nuevo."
                );
              } finally {
                detenerIndicador(botonSele.index);
              }

              
            }
            break;
        
                 case 6:
            const jefes = await obtenerJefesNave({
              idu_usuario: String(iduUsuario)
            });

            if (jefes.jefesDeNave.length === 0) {
              Alert.alert("Error", "No hay jefes de nave para este usuario");
            }
            const ValidarGuardardoJefesNave = await guardarListajefesNave(
              jefes.jefesDeNave
            );
            if (ValidarGuardardoJefesNave) {
              Alert.alert("", "Jefes sincronizados");
              setBotones((prev) =>
                prev.map((b) =>
                  b.index === botonSele.index
                    ? { ...b, sincro: b.sincro === true ? false : true }
                    : b
                )
              );
            } else {
              Alert.alert("Error", "No se pudo actualizar lista de lotes");
              setBotones((prev) =>
                prev.map((b) =>
                  b.index === botonSele.index
                    ? { ...b, selec: b.selec === 1 ? 0 : 1 }
                    : b
                )
              );
            }

            break;
          
          }
      }
    }
  };

  
  return (
    <Animated.View style={[styles.AnimatedView, { opacity: fadeAnimInputs }]}>
      <SafeAreaView>
        <View style={styles.header}>
          <Header titulo="SINCRONIZAR" pantalla="" />
        </View>
        <View style={styles.main}>
          {botones.map((boton, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                setBotones((prev) =>
                  prev.map((b) =>
                    b.index === boton.index
                      ? { ...b, selec: b.selec === 0 ? 1 : 0 }
                      : b
                  )
                )
              }
              style={{
                width: "90%",
                height: 50,
                backgroundColor: "white",
                elevation: 10,
                display: "flex",
                justifyContent: "center",
                marginVertical: 5,
                flexDirection: "row",
                borderRadius: 10
              }}
            >
              <View
                style={{
                  width: "10%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                <Avatar.Icon
                  color="#13c044"
                  style={{ backgroundColor: "", paddingLeft: 0 }}
                  size={40}
                  icon={boton.icono}
                />
              </View>
              <View
                style={{
                  width: "80%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  paddingLeft: 20
                }}
              >
                <Text variant="bodyMedium">{boton.nombre}</Text>
              </View>
              <View
                style={{
                  width: "10%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                {boton.sincro ? (
                  <ActivityIndicator
                    animating={true}
                    color={"#13c044"}
                  />
                ) : (
                  <IconButton
                    icon={
                      boton.selec === 0
                        ? ""
                        : require("../assets/check-bold.png")
                    }
                    key={boton.index}
                    iconColor="green"
                    size={20}
                    style={{
                      width: 15,
                      height: 15,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.footer}>
          <View
            style={{
              width: "80%",
              height: 40,

              display: "flex",
              justifyContent: "center"
            }}
          >
            <Button
              icon=""
              mode="contained"
              onPress={handleActualizar}
              style={{ backgroundColor: "#13c044" }}
            >
              Actualizar
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  AnimatedView: {
    flex: 1,
    marginTop: 30,
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#e8e9f1ff"
  },
  header: {
    width: "100%",
    height: "6%",
    backgroundColor: ""
  },
  main: {
    width: "100%",
    height: "50%",
    backgroundColor: "",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  footer: {
    width: "100%",
    height: "47%",
    backgroundColor: "",
    display: "flex",
    justifyContent: "center",

    flexDirection: "row"
  }
});
