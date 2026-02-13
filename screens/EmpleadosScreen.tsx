import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
  Alert,
  ActivityIndicator
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import {
  Text,
  TextInput,
  Button,
  List,
  Divider,
  Snackbar,
  Modal,
  Portal
} from "react-native-paper";
import { obtenerListaNavesSqlite } from "../src/services/local/guardarListaDeNavesEnDbLocal";
import { useEmployee } from "../src/context/QrContext";
import { Animated, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../src/components/Header";
import { obtenerListaLotesxUsuarioSqLite } from "../src/services/local/guardarListaDeLotesEnDbLocal";
import { IListaLotesxUsuario } from "../src/interfaces/local/IListaLotesxUsuario";
import { IEmpleadoCapturado } from "../src/interfaces/local/IEmpleadoCapturado";
import { useUser } from "../src/context/userContext";
import { useNave } from "../src/context/NaveContext";
import dayjs from "dayjs";
import { IAvanceEmpleado } from "../src/interfaces/local/IAvanceEmpleado";
import {
  AsentarEmpleados,
  GuardarEmpleadosCapturados,
  SeleccioarEmpleadosparaAsignarActividad,
  obtenerSemanaActivaSqLite,
  BuscarEmpleadoPorCodigo
} from "../src/services/sqlite";

type Props = NativeStackScreenProps<RootStackParamList, "Empleados">;

type boton = {
  nombre: string;
  nombre2: string;
  icono: ImageSourcePropType;
};

export default function EmpleadosScreen({ navigation }: Props) {
  const botones = [
    {
      nombre: "Agregar",
      nombre2: "Empleado",
      icono: require("../assets/account-box-edit-outline.png")
    },
    {
      nombre: "Borrar",
      nombre2: "Empleado",
      icono: require("../assets/eraser.png")
    },
    {
      nombre: "Asentar",
      nombre2: "Empleados",
      icono: require("../assets/database-plus-outline.png")
    },
    {
      nombre: "Ver Empleados",
      nombre2: "capturados",
      icono: require("../assets/view-list.png")
    },
    {
      nombre: "Escanear",
      nombre2: "QR Empleado",
      icono: require("../assets/qrcode-scan.png")
    }
  ];
  const fecha = dayjs().format("YYYY-MM-DD");
  const { listaEmpleadosCapturados, setEmpleadosCap, clearEmpleados } =
    useUser();
  const { codLote, setCodLote, clearCodLote } = useEmployee();
  const { codNave, setCodNave, clearCodNave } = useNave();
  const fadeAnimInputs = useRef(new Animated.Value(0)).current;
  const translateYInputs = useRef(new Animated.Value(200)).current;
  const [codEmpleado, setCodEmpleado] = useState<string>("");
  const [nombreEmpl, setNombreEmp] = useState<string>("");
  const {
    employeeCode,
    nombreEmpleadoState,
    clearEmployeeCode,
    clearNombre,
    setEmployeeCode,
    setNombreEmpleado
  } = useEmployee();
  const [ListaNaves, setListaNaves] = useState<any[]>([]);
  const [listaLotes, setListaLotes] = useState<IListaLotesxUsuario[]>([]);
  const [datosLote, setDatosLote] = useState({
    textoLote: "Seleccione Lote",
    codLote: "",
    expandedLote: false,
    descripcionLote: ""
  });
  const [visibleModal, setVisibleModal] = React.useState(false);
  const [datosNave, setDatosNave] = useState({
    textoNave: "Seleccione Nave",
    codNave: "",
    expandendNave: false,
    descripcionNave: ""
  });
  const [empleadosAsentar, setEmpleadosAsentar] = useState<IAvanceEmpleado[]>(
    []
  );

  const [visible, setVisible] = React.useState(false);
  const onToggleSnackBar = () => setVisible(!visible);
  const onDismissSnackBar = () => setVisible(false);

  useEffect(() => {
    setNombreEmp(nombreEmpleadoState ? nombreEmpleadoState : "");
  }, [nombreEmpleadoState]);

  useEffect(() => {
    if (datosLote.expandedLote)
      setDatosNave((prev: any) => ({ ...prev, expandendNave: false }));
  }, [datosLote.expandedLote]);

  useEffect(() => {
    async function obtenerNaves() {
      const listaNaves = await obtenerListaNavesSqlite(datosLote.codLote);
      setListaNaves(listaNaves as any[]);
    }

    if (datosLote.codLote.trim() !== "") obtenerNaves();
  }, [datosLote.codLote]);

  useEffect(() => {
    async function getLotes() {
      const lotes = await obtenerListaLotesxUsuarioSqLite();

      setListaLotes(lotes as IListaLotesxUsuario[]);
    }
    getLotes();
  }, []);

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

  useEffect(() => {
    async function guardar() {
      //  const resAsentados = await AsentarEmpleados(empleadosAsentar);

      const semana: any[] = await obtenerSemanaActivaSqLite();
      const listaEmp: IEmpleadoCapturado[] = empleadosAsentar.map(
        (empleado, index) => ({
          cod_lote: empleado.cod_lote,
          cod_empleado: empleado.cod_empleado,
          Nom_empleado: empleado.nom_empleado,
          cod_nave: empleado.cod_nave,
          FechaRegistro: fecha,
          semana: semana[0].semanaActiva
        })
      );

      const guardarEm = await GuardarEmpleadosCapturados(listaEmp);

      if (guardarEm) {
        console.log("empleados asentados");
        Alert.alert("", "Los empleados se guardaron correctamente!");
        clearEmpleados();
        setEmpleadosAsentar([]);
      }
    }
    if (empleadosAsentar.length > 0) guardar();
  }, [empleadosAsentar]);
  useEffect(() => {}, [codLote]);

  useEffect(() => {
    if (datosNave.codNave !== "") consulta();

    async function consulta() {
      const datos = await SeleccioarEmpleadosparaAsignarActividad(
        datosLote.codLote,
        datosNave.codNave,
        fecha,
        "",
        ""
      );
      console.log("data", datos);
      //await limpiarTablaAvances("22");
    }
  }, [codNave]);

  const showModal = () => setVisibleModal(true);
  const hideModal = () => setVisibleModal(false);
  const handleNaveAccordionPress = () => {
    //si no se ha seleccionado un lote, no se puede expandir el acordeon de nave
    if (datosLote.codLote.trim() === "") {
      alert("Por favor, seleccione un lote primero");
      return;
    }

    //cambia el estado de expandedNaves
    setDatosNave((prev) => ({
      ...prev,
      expandendNave: !prev.expandendNave
    }));
  };

  useEffect(() => {
    if (codEmpleado.length === 6) {
      fetchEmployeeName();
    }

    async function fetchEmployeeName() {
      const res: any = await BuscarEmpleadoPorCodigo(codEmpleado as string);

      if ((await res).length > 0) {
        setNombreEmp(res[0].Nom_empleado);
      } else {
        Alert.alert("", "Empleado no encontrado");
        setCodEmpleado("");
        setNombreEmp("");
      }
    }
  }, [codEmpleado]);

  useEffect(() => {
    setCodEmpleado(employeeCode ? employeeCode : "");
  }, [employeeCode]);

  const handleChangeCodEmpleado = (codEmpleado: string) => {
    setCodEmpleado(codEmpleado);
    // setEmployeeCode(codEmpleado);
  };

  const handleSetNombre = (nombre: string) => {
    setNombreEmpleado(nombre);
    //setNombreEmp(Text)
  };
  const handleNaveSeleccion = (codNave: string, textoNave: string) => {
    setCodNave(codNave);
    setDatosNave((prev) => ({
      ...prev,
      codNave: codNave,
      textoNave: codNave + " " + textoNave,
      expandendNave: false,
      descripcionNave: textoNave
    }));
  };

  const handleLoteSeleccion = (codLote: string, textoLote: string) => {
    setCodLote(codLote);
    setDatosLote((prev) => ({
      ...prev,
      codLote: codLote,
      textoLote: codLote + " " + textoLote,
      expandedLote: false,
      descripcionLote: textoLote
    }));
    setDatosNave((prev) => ({
      ...prev,
      textoNave: "Seleccione Nave",
      codNave: ""
    }));
  };

  const handleBotonPresionado = async (nombre: string) => {
    if (nombre === "Escanear") {
      navigation.navigate("Escaner");
    } else if (nombre === "Agregar") {
      if (
        datosNave.codNave === "" ||
        datosLote.codLote === "" ||
        codEmpleado === null ||
        nombreEmpl === null ||
        codEmpleado.trim() === "" ||
        nombreEmpl.trim() === ""
      ) {
        Alert.alert("", "LLene el formulario");
        return;
      }

      AgregarEmpleado();
    } else if (nombre === "Ver Empleados") {
      showModal();
    } else if (nombre === "Asentar") {
      if (listaEmpleadosCapturados.length === 0) {
        Alert.alert("Alerta", "No hay empleados para asentar");
        return;
      }
      const semana: any = await obtenerSemanaActivaSqLite();

      const empleadosParaAsentar = listaEmpleadosCapturados.map(
        (empleado, index) => ({
          cod_lote: empleado.cod_lote,
          cod_nave: empleado.cod_nave,
          desc_nave: datosNave.descripcionNave,
          cod_actividad: "",
          cod_avance: "",
          des_actividad: "",
          cod_empleado: empleado.cod_empleado,
          nom_empleado: empleado.Nom_empleado,
          avance: "0",
          avanceA: "0",
          semanaActiva: semana[0].semanaActiva,
          fecha: fecha
        })
      );
      setEmpleadosAsentar(empleadosParaAsentar as IAvanceEmpleado[]);
    }
  };

  function AgregarEmpleado() {
    setEmpleadosCap((prev: IEmpleadoCapturado[]) => {
      const existe = prev.some(
        (emp) =>
          emp.cod_empleado === codEmpleado &&
          emp.cod_lote === datosLote.codLote &&
          emp.cod_nave === datosNave.codNave &&
          emp.FechaRegistro === ""
      );

      if (existe) {
        alert(
          `El empleado ${nombreEmpl} (código ${codEmpleado}) ya está asignado al lote ${datosLote.codLote} y nave ${datosNave.codNave}.`
        );

        return prev;
      }

      clearEmployeeCode();
      clearNombre();
      setNombreEmp("");
      setCodEmpleado("");
      setVisible(true);
      return [
        ...prev,
        {
          cod_empleado: codEmpleado,
          Nom_empleado: nombreEmpl,
          cod_lote: datosLote.codLote,
          cod_nave: datosNave.codNave,
          FechaRegistro: new Date().toISOString().split("T")[0],
          semana: ""
        }
      ];
    });
  }

  return (
    <Animated.View style={[styles.AnimatedView, { opacity: fadeAnimInputs }]}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Header titulo="Empleados" pantalla="Inicio" />
        </View>

        <View style={styles.mainContent}>
          <View>
            <List.Section
              title=""
              style={{ borderRadius: 5, backgroundColor: "white" }}
            >
              <List.Accordion
                title={datosLote.textoLote}
                expanded={datosLote.expandedLote}
                onPress={() =>
                  setDatosLote((prev) => ({
                    ...prev,
                    expandedLote: !prev.expandedLote
                  }))
                }
              >
                <ScrollView
                  style={{
                    backgroundColor: "white",
                    height: 200
                  }}
                >
                  {listaLotes.map((lote, index) => (
                    <View key={index}>
                      <List.Item
                        left={(props) => (
                          <List.Icon
                            {...props}
                            icon={require("../assets/land-plots.png")}
                          />
                        )}
                        title={lote.cod_lote + " " + lote.nom_lote}
                        onPress={() => {
                          handleLoteSeleccion(lote.cod_lote, lote.nom_lote);
                        }}
                      />
                      <Divider />
                    </View>
                  ))}
                </ScrollView>
              </List.Accordion>
            </List.Section>
            <List.Section title="" style={{ borderRadius: 5 }}>
              <List.Accordion
                title={datosNave.textoNave}
                expanded={datosNave.expandendNave}
                onPress={handleNaveAccordionPress}
              >
                <ScrollView
                  style={{
                    backgroundColor: "white",
                    height: 200
                  }}
                >
                  {ListaNaves.map((nave, index) => (
                    <View key={index}>
                      <List.Item
                        left={(props) => (
                          <List.Icon
                            {...props}
                            icon={require("../assets/land-plots.png")}
                          />
                        )}
                        title={nave.cod_nave + " " + nave.Descripcion_nave}
                        onPress={() =>
                          handleNaveSeleccion(
                            nave.cod_nave,
                            nave.Descripcion_nave
                          )
                        }
                      />
                      <Divider />
                    </View>
                  ))}
                </ScrollView>
              </List.Accordion>
            </List.Section>
            <View>
              <TextInput
                value={codEmpleado}
                onChangeText={(text: string) => handleChangeCodEmpleado(text)}
                label="Codigo de empleado"
                style={styles.inputText}
                mode="outlined"
                maxLength={6}
                underlineColor="green"
                activeUnderlineColor="green"
                textColor="#150000ff"
                placeholder="400"
                dense={true}
                outlineColor="#2730267e"
                keyboardType="numeric"
              />
              <TextInput
                value={nombreEmpl}
                onChangeText={(Text: string) => handleSetNombre(Text)}
                label="Nombre de empleado"
                style={styles.inputText}
                mode="outlined"
                maxLength={50}
                underlineColor="green"
                activeUnderlineColor="green"
                textColor="#150000ff"
                placeholder=""
                dense={true}
                outlineColor="#2730267e"
              />
              <Button
                mode="contained"
                onPress={() => navigation.navigate("ListaEmpleados")}
                buttonColor="green"
              >
                Ver lista de empleados
              </Button>
            </View>
          </View>
          <View style={styles.grid}>
            {botones.map((boton, index) => (
              <TouchableOpacity
                key={index}
                style={styles.cell}
                onPress={() => {
                  handleBotonPresionado(boton.nombre);
                }}
              >
                <View style={styles.boton}>
                  <Image
                    style={{ width: "60%", height: "60%" }}
                    source={boton.icono}
                  />
                </View>

                <Text variant="bodySmall" style={{ marginTop: 5 }}>
                  {boton.nombre}
                </Text>
                <Text variant="bodySmall">{boton.nombre2}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.foot}>
          <Snackbar
            visible={visible}
            onDismiss={onDismissSnackBar}
            action={{
              label: "Ok",
              onPress: () => {
                // Do something
              }
            }}
          >
            Empleado agreado correctamente
          </Snackbar>
        </View>

        <Portal>
          <Modal
            visible={visibleModal}
            onDismiss={hideModal}
            style={{
              width: "100%",
              height: "80%",
              backgroundColor: "",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column"
            }}
          >
            <View
              style={{
                width: "90%",
                height: "80%",
                backgroundColor: "white",
                marginHorizontal: "auto"
              }}
            >
              <View
                style={{
                  width: "100%"
                }}
              >
                <Text variant="bodySmall" style={{ textAlign: "center" }}>
                  EMPLEADOS AGREGADOS
                </Text>
              </View>

              <ScrollView horizontal>
                <View>
                  <View
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "row",
                      backgroundColor: "green"
                    }}
                  >
                    <View
                      style={{
                        width: "17%"
                      }}
                    >
                      <Text
                        variant="bodySmall"
                        style={{ textAlign: "center", color: "white" }}
                      >
                        Cod. lote
                      </Text>
                    </View>
                    <View
                      style={{
                        width: "17%"
                      }}
                    >
                      <Text
                        variant="bodySmall"
                        style={{ textAlign: "center", color: "white" }}
                      >
                        Cod. nave
                      </Text>
                    </View>
                    <View
                      style={{
                        width: "25%"
                      }}
                    >
                      <Text
                        variant="bodySmall"
                        style={{ textAlign: "center", color: "white" }}
                      >
                        Cod. empleado
                      </Text>
                    </View>
                    <View
                      style={{
                        width: "41%"
                      }}
                    >
                      <Text
                        variant="bodySmall"
                        style={{ textAlign: "center", color: "white" }}
                      >
                        Nombre empleado
                      </Text>
                    </View>
                  </View>
                  <ScrollView>
                    {listaEmpleadosCapturados.map((empleado, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row" // cada fila
                        }}
                      >
                        <View
                          style={{
                            borderTopWidth: 1,
                            paddingHorizontal: 10,
                            width: "17%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Text variant="bodySmall">{empleado.cod_lote}</Text>
                        </View>
                        <View
                          style={{
                            borderTopWidth: 1,
                            paddingHorizontal: 10,
                            width: "17%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Text variant="bodySmall">{empleado.cod_nave}</Text>
                        </View>
                        <View
                          style={{
                            borderTopWidth: 1,
                            paddingHorizontal: 10,
                            width: "25%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Text variant="bodySmall">
                            {empleado.cod_empleado}
                          </Text>
                        </View>
                        <View
                          style={{
                            borderTopWidth: 1,
                            paddingHorizontal: 10,
                            width: "41%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Text variant="bodySmall">
                            {empleado.Nom_empleado}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>
            </View>
            <View
              style={{
                width: "90%",
                height: "20%",
                backgroundColor: "",
                marginHorizontal: "auto",
                display: "flex",
                justifyContent: "flex-end",
                paddingBottom: 50
              }}
            >
              <Button
                mode="contained"
                onPress={hideModal}
                style={{ backgroundColor: "green" }}
              >
                Cerrar ventana
              </Button>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  AnimatedView: {
    width: "100%",
    height: "100%",
    marginTop: 30,
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#e5e9f4ff"
  },
  headerContainer: {
    backgroundColor: "#e5e9f4ff",
    width: "100%",
    height: "5%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  container: {
    backgroundColor: "#e5e9f4ff",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  mainContent: {
    width: "90%",
    height: "90%",
    backgroundColor: ""
  },
  foot: {
    width: "90%",
    height: "5%",
    backgroundColor: ""
  },
  inputText: {
    backgroundColor: "#e5e9f4ff",
    marginBottom: 10
  },
  boton: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    marginTop: 15
  },
  cell: {
    width: "33.33%",
    height: 120,
    alignItems: "center",
    justifyContent: "center"
  }
});
