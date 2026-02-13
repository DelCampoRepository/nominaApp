import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { ScrollView, Animated, TouchableOpacity, Alert } from "react-native";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import { Text, TextInput, Button, List } from "react-native-paper";
import Header from "../src/components/Header";
import { useUser } from "../src/context/userContext";
import HeaderTablaActiAva from "../src/components/HeaderTablaActiAva";
import { IAvanceEmpleado } from "../src/interfaces/local/IAvanceEmpleado";
import { IConsultarAvance } from "../src/interfaces/IConsultarAvance";
import { ConsultarAvance } from "../src/services/ConsultaWSValidaActividadConPresupuesto";
import { IEmpleadosParaAsentar } from "../src/interfaces/IEmpleadosParaAsentar";
import { IWDatos } from "../src/interfaces/IEmpleadosParaAsentar";
import { GuardarAvancesEnDb } from "../src/services/GuardarAvancesAAsenar";
import {
  AsentarEmpleados,
  SeleccioarEmpleadosparaAsignarActividad,
  ActualizarAvances,
  obtenerSemanaActivaSqLite,
  SeleccionarEmpleadosCapturados
} from "../src/services/sqlite";
import dayjs from "dayjs";
type Props = NativeStackScreenProps<RootStackParamList, "AvancesxActividad">;

export default function AvancesxActividadesScreen({
  route,
  navigation
}: Props) {
  const fadeAnimInputs = useRef(new Animated.Value(0)).current;
  const [ediciones, setEdiciones] = useState<Record<string, string>>({});
  const [AvancesEmpleado, setAvancesEmpleado] = useState<IAvanceEmpleado[]>([]);
  const [guardar, setGuardar] = useState(false);
  const [totales, setTotales] = useState({
    totalAvance: 0,
    totalJornal: 0
  });
  const { listaEmpleadosCapturados, setEmpleadosCap, clearEmpleados } =
    useUser();
  const translateYInputs = useRef(new Animated.Value(200)).current;
  const {
    lote,
    desLote,
    codNave,
    desNave,
    rendApli,
    redTop,
    nomAct,
    coAct,
    codAv,
    unidad
  } = route.params;

  const [listaParaAsentar, setListaParaAsentar] =
    useState<IEmpleadosParaAsentar>();
  const [wDatosAsentar, setWdatosAsentar] = useState<IWDatos[]>([]);
  const [resultado, setResultado] = useState<number | null>(null);
  const fecha = dayjs().format("YYYY-MM-DD");
  const [avanceGeneral, setAvanceGeneral] = useState("");
  //console.log(AvancesEmpleado);
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
    async function obtenerEmpleados() {
      //  await limpiarTablaAvances("[{semanaActiva=22}]");
      const semana: any[] = await obtenerSemanaActivaSqLite();
      const Lista = await SeleccionarEmpleadosCapturados(
        lote,
        codNave,
        fecha,
        semana[0].semanaActiva,
        coAct,
        codAv
      );

      /*  const Lista = await SeleccioarEmpleadosparaAsignarActividad(
        coAct,
        codAv,
        fecha,
        coAct,
        codAv
      );*/

      const empleados = Lista.map((emp, index) => ({
        cod_lote: lote,
        cod_nave: codNave,
        desc_nave: desNave,
        cod_actividad: coAct,
        cod_avance: codAv,
        des_actividad: nomAct,
        cod_empleado: emp.cod_empleado,
        nom_empleado: emp.nom_empleado,
        avance: emp.avance,
        avanceA: emp.avanceA,
        fecha: fecha,
        semanaActiva: semana[0].semanaActiva
      }));

      setAvancesEmpleado(empleados as IAvanceEmpleado[]);
    }

    obtenerEmpleados();
  }, []);

  useEffect(() => {
    var totalAv = 0;
    for (let empleado of AvancesEmpleado) {
      totalAv += Number(empleado.avance);
    }

    const rendApTotal = totalAv / rendApli;

    setTotales({
      totalAvance: totalAv,
      totalJornal: rendApTotal
    });
    //  console.log("los emp", AvancesEmpleado);
  }, [AvancesEmpleado]);

  useEffect(() => {}, [totales]);
  useEffect(() => {
    if (guardar) {
      actualizarAvances();
    }

    async function actualizarAvances() {
      await ActualizarAvances(AvancesEmpleado);
      setGuardar(false);
    }
  }, [guardar]);

  useEffect(() => {
    if (wDatosAsentar.length !== 0) {
      setListaParaAsentar({
        cod_lote: lote,
        cod_nave: codNave,
        wDatos: wDatosAsentar
      });
    }
  }, [wDatosAsentar]);

  useEffect(() => {
    async function AsentarADb() {
      /* const res = await GuardarAvancesEnDb(
        listaParaAsentar as IEmpleadosParaAsentar
      );
      ///  console.log(res);
      if (res[0].estado == 1) {
        Alert.alert("", "Los empleados se han asentado");
      } else {
        Alert.alert("ERROR", "no se enviaron los empleados para asentar");
      }*/
    }

    if (wDatosAsentar.length !== 0) AsentarADb();
  }, [listaParaAsentar]);

  const handle = () => {
    navigation.goBack();
  };

  const handleBotonAgregar = () => {
    setAvancesEmpleado((prev) =>
      prev.map((emp) => ({
        ...emp,
        avance: avanceGeneral,
        avanceA: avanceGeneral
      }))
    );
  };
  const HandleOnChangeAvanceGeneral = (text: string) => {
    const regex = /^(\d+(\.\d*)?|\.\d*)?$/;
    if (text !== "") {
      if (!regex.test(text)) return;
    }

    const numero = parseFloat(text);
    var valor = parseFloat(text);
    if (isNaN(valor)) valor = 0;
    var valido = Number(valor) / Number(rendApli);
    if (valido > redTop) {
      Alert.alert(
        "ERROR",
        "CANTIDAD SUPERA EL TOPE DE JORNALES PARA ESTA ACTIVIDAD, VERIFIQUELO!"
      );
      return;
    }

    if (!isNaN(numero)) {
      setAvanceGeneral(text);
    } else {
      setAvanceGeneral(text);
    }
  };

  const handleChange = async (index: number, text: string) => {
    //actualizamos
    //setEdiciones((prev) => ({ ...prev, [index]: text }));

    const regex = /^(\d+(\.\d*)?|\.\d*)?$/;
    if (text !== "") {
      if (!regex.test(text)) return;
    }

    const numero = parseFloat(text);
    var valor = parseFloat(text);
    if (isNaN(valor)) valor = 0;
    var valido = Number(valor) / Number(rendApli);
    if (valido > redTop) {
      Alert.alert(
        "ERROR",
        "CANTIDAD SUPERA EL TOPE DE JORNALES PARA ESTA ACTIVIDAD, VERIFIQUELO!"
      );
      return;
    }

    if (!isNaN(numero)) {
      setAvancesEmpleado((prev) => {
        const actualizados = [...prev];
        actualizados[index] = {
          ...actualizados[index],
          avanceA: String(text),
          avance: String(text),
          cod_actividad: coAct,
          cod_avance: codAv,
          des_actividad: nomAct
        };
        return actualizados;
      });
    } else {
      setAvancesEmpleado((prev) => {
        const actualizados = [...prev];
        actualizados[index] = {
          ...actualizados[index],
          avanceA: String(text),
          avance: String(text),
          cod_actividad: coAct,
          cod_avance: codAv,
          des_actividad: nomAct
        };
        return actualizados;
      });
    }
  };

  const handleActualizarTodo = () => {
    setAvancesEmpleado((prev) => {
      const actualizados = prev.map((empleado, index) => {
        const textoEditado = ediciones[index];

        if (textoEditado === undefined) return empleado;

        const valor = parseFloat(textoEditado);
        if (isNaN(valor)) {
          alert(
            `⚠️ Valor inválido para ${empleado.nom_empleado}: ${textoEditado}`
          );
          return empleado;
        }

        return { ...empleado, avance: String(valor), avanceA: String(valor) };
      });
      alert("✅ Todos los avances válidos fueron actualizados.");
      return actualizados;
    });
    setGuardar(true);
  };

  const handleAsentar = () => {
    if (AvancesEmpleado.length === 0) {
      Alert.alert("Error", "No hay empleados con avances para asentar");
      return;
    } else {
      const wDatosAsentar = AvancesEmpleado.map((empleado, index) => ({
        cod_act: empleado.cod_actividad,
        cod_avn: codAv,
        cod_emp: empleado.cod_empleado,
        avances: empleado.avance,
        bandera: "",
        avancesA: empleado.avanceA,
        rendAplicado: rendApli
      }));

      setWdatosAsentar(wDatosAsentar as IWDatos[]);
    }
  };

  return (
    <Animated.View style={[styles.AnimatedView, { opacity: fadeAnimInputs }]}>
      <SafeAreaView>
        <View style={styles.header}>
          <Header titulo="AVANCES POR ACTIVIDAD" pantalla="" />
        </View>
        <View style={styles.main}>
          <View style={{ width: "100%", backgroundColor: "" }}>
            <Text variant="bodyMedium" style={{ textAlign: "center" }}>
              NAVE: {codNave + " " + desNave}
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: "center" }}>
              {"ACTIVIDAD: " + coAct + "-" + codAv + " " + nomAct}
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: "center" }}>
              {"RENDIMIENTO: " + rendApli + " " + unidad}
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: "center" }}>
              {"FECHA: " + fecha}
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: "center" }}>
              {" LOTE: " + lote + " " + desLote}
            </Text>
          </View>

          <View style={{ width: "100%", backgroundColor: "" }}>
            <View
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 20
              }}
            >
              <View
                style={{
                  marginHorizontal: 5,
                  marginVertical: 10,
                  width: "80%"
                }}
              >
                <Button
                  icon=""
                  mode="contained"
                  onPress={handleActualizarTodo}
                  style={{ backgroundColor: "green" }}
                >
                  Guardar
                </Button>
              </View>
              <View
                style={{
                  marginHorizontal: 5,
                  marginVertical: 10,
                  width: "90%",
                  backgroundColor: "",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center"
                }}
              >
                <View style={{ marginHorizontal: 20, width: "40%" }}>
                  <TextInput
                    label="Avance"
                    keyboardType="decimal-pad"
                    value={avanceGeneral}
                    style={{
                      width: "100%",
                      height: 35,
                      fontSize: 16,
                      backgroundColor: "white"
                    }}
                    mode="flat"
                    activeOutlineColor=""
                    outlineColor=""
                    underlineColor=""
                    onChangeText={(text: string) =>
                      HandleOnChangeAvanceGeneral(text)
                    }
                  />
                </View>
                <View style={{ marginHorizontal: 20, width: "40%" }}>
                  <Button
                    icon=""
                    mode="contained"
                    onPress={handleBotonAgregar}
                    style={{ backgroundColor: "green" }}
                  >
                    Agregar
                  </Button>
                </View>
              </View>
            </View>
            <View
              style={{
                width: "90%",
                height: "100%",
                backgroundColor: "",
                marginHorizontal: "auto"
              }}
            >
              <ScrollView horizontal>
                <View>
                  <View
                    style={{
                      width: "100%",
                      height: "3%",
                      borderTopRightRadius: 10,
                      borderTopLeftRadius: 10,
                      marginTop: 40
                    }}
                  >
                    <HeaderTablaActiAva
                      columnas={[
                        { nombre: "Codigo", tamaño: 100 },

                        { nombre: "Avance A.", tamaño: 100 },
                        { nombre: "Nombre", tamaño: 300 }
                      ]}
                    />
                  </View>

                  <View style={{ height: "40%", backgroundColor: "" }}>
                    <ScrollView>
                      {AvancesEmpleado.map((empleado, index) => (
                        <View
                          key={index}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            backgroundColor: "white"
                          }}
                        >
                          <View
                            style={{
                              width: 100,
                              height: 35,
                              backgroundColor: "",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Text
                              variant="bodySmall"
                              style={{ textAlign: "center" }}
                            >
                              {empleado.cod_empleado}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: 100,
                              height: 34,
                              paddingHorizontal: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderLeftWidth: 1
                            }}
                          >
                            <TextInput
                              label=""
                              keyboardType="decimal-pad"
                              value={String(empleado.avanceA)}
                              style={{
                                width: "100%",
                                height: 35,
                                fontSize: 16,
                                backgroundColor: "white"
                              }}
                              mode="flat"
                              activeOutlineColor=""
                              outlineColor=""
                              underlineColor=""
                              onChangeText={(text) => handleChange(index, text)}
                            />
                          </View>
                          <View
                            style={{
                              width: 300,
                              height: 35,
                              backgroundColor: "",
                              display: "flex",
                              justifyContent: "center",
                              paddingLeft: 10
                            }}
                          >
                            <Text
                              variant="bodySmall"
                              style={{ textAlign: "left" }}
                            >
                              {empleado.nom_empleado}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column"
            }}
          >
            <View style={{ marginTop: 40 }}>
              <Text variant="bodyMedium" style={{ marginHorizontal: 50 }}>
                {"TOTAL AVANCE: " + totales.totalAvance}
              </Text>
            </View>
            <View>
              <Text variant="bodyMedium" style={{ marginHorizontal: 50 }}>
                {"TOTAL JORNAL: " + totales.totalJornal}
              </Text>
            </View>
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
    height: "79%",
    backgroundColor: ""
  },
  footer: {
    width: "100%",
    height: "15%",
    backgroundColor: ""
  }
});
