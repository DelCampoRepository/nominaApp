import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import Header from "../src/components/Header";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Animated } from "react-native";
import { List, Divider, TextInput, Button, Text } from "react-native-paper";
import { useState, useEffect, useRef } from "react";
import { IListaLotesxUsuario } from "../src/interfaces/local/IListaLotesxUsuario";
import { obtenerListaLotesxUsuarioSqLite } from "../src/services/local/guardarListaDeLotesEnDbLocal";
import { obtenerListaNavesSqlite } from "../src/services/local/guardarListaDeNavesEnDbLocal";
import { useNave } from "../src/context/NaveContext";
import { useEmployee } from "../src/context/QrContext";
import HeaderTablaActiAva from "../src/components/HeaderTablaActiAva";
import { ConsultarListaActividadesxNave } from "../src/services/local/guardarListaDeNavesEnDbLocal";
import {
  SeleccionarActividadesNave,
  obtenerSemanaActivaSqLite
} from "../src/services/sqlite";

type Props = NativeStackScreenProps<RootStackParamList, "Avances">;

export default function AvancesSCreen({ navigation }: Props) {
  const [listaLotes, setListaLotes] = useState<IListaLotesxUsuario[]>([]);
  const { codNave, setCodNave, clearCodNave } = useNave();
  const fadeAnimInputs = useRef(new Animated.Value(0)).current;
  const translateYInputs = useRef(new Animated.Value(200)).current;
  const [ListaNaves, setListaNaves] = useState<any[]>([]);
  const [codEmpleado, setCodEmpleado] = useState<string>("");
  const [listaActividades, setListaActividades] = useState<any[]>([]);
  const [datosLote, setDatosLote] = useState({
    textoLote: "Seleccione lote",
    codLote: "",
    expandedLote: false,
    descripcionLote: ""
  });

  const [datosNave, setDatosNave] = useState({
    textoNave: "Seleccione nave",
    codNave: "",
    expandendNave: false,
    descripcionNave: ""
  });

  const handleLoteSeleccion = (codLote: string, textoLote: string) => {
    setDatosLote((prev) => ({
      ...prev,
      codLote: codLote,
      textoLote: codLote + " " + textoLote,
      expandedLote: false,
      descripcionLote: textoLote
    }));
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
  const { employeeCode, clearEmployeeCode } = useEmployee();

  useEffect(() => {
    setCodEmpleado(employeeCode ? employeeCode : "");
  }, [employeeCode]);

  useEffect(() => {
    async function obtenerLotes() {
      const result = await obtenerListaLotesxUsuarioSqLite();

      setListaLotes(result as IListaLotesxUsuario[]);
    }

    if (listaLotes.length <= 0) obtenerLotes();
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
    async function obtenerNaves() {
      const listaNaves = await obtenerListaNavesSqlite(datosLote.codLote);
      setListaNaves(listaNaves as any[]);
    }

    if (datosLote.codLote.trim() !== "") obtenerNaves();
  }, [datosLote.codLote]);

  useEffect(() => {
    if (datosNave.codNave != "") consultar();

    async function consultar() {
      const semana: any = await obtenerSemanaActivaSqLite();
      const listaActivi = await SeleccionarActividadesNave(
        datosLote.codLote,
        datosNave.codNave,
        semana[0].semanaActiva
      );
      console.log("lista act xnave par avance0", listaActivi);
      setListaActividades(listaActivi);
    }
  }, [datosNave.codNave]);

  const handleActiviadaSelec = () => {};

  return (
    <Animated.View style={[styles.AnimatedView, { opacity: fadeAnimInputs }]}>
      <SafeAreaView>
        <View style={styles.header}>
          <Header titulo="AVANCES" pantalla="Inicio" />
        </View>
        <View style={styles.main}>
          <View style={{ width: "90%", height: "100%", marginBottom: 10 }}>
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
            <View style={styles.tableContainer}>
              <ScrollView horizontal>
                <View>
                  <View
                    style={{
                      width: "100%",
                      height: "4%",
                      borderTopRightRadius: 10,
                      borderTopLeftRadius: 10
                    }}
                  >
                    <HeaderTablaActiAva
                      columnas={[
                        { nombre: "Codigo", tamaño: 100 },
                        { nombre: "Descripcion", tamaño: 320 },
                        { nombre: "Rend apli.", tamaño: 100 },
                        { nombre: "Rend Top.", tamaño: 100 }
                      ]}
                    />
                  </View>
                  <View style={{ marginTop: 0, height: "90%" }}>
                    <ScrollView>
                      {listaActividades.length > 0 &&
                        listaActividades.map((actividad, index) => (
                          <TouchableOpacity
                            onPress={() => {
                              navigation.navigate("AvancesxActividad", {
                                lote: datosLote.codLote,
                                desLote: datosLote.descripcionLote,
                                codNave: datosNave.codNave,
                                desNave: datosNave.descripcionNave,
                                rendApli: actividad.Rendimiento_Aplic,
                                redTop: actividad.Rendimiento_Tope,
                                nomAct: actividad.nom_actividad
                                  ? actividad.nom_actividad
                                  : actividad.des_actividad,
                                coAct: actividad.cod_actividad,
                                codAv: actividad.cod_avance,
                                rednApl: Number(actividad.Rendimiento_Aplic),
                                unidad: actividad.Nom_Corto
                              });
                            }}
                            key={index}
                            style={{
                              display: "flex",
                              flexDirection: "row"
                            }}
                          >
                            <View
                              style={{ backgroundColor: "white", width: 100 }}
                            >
                              <Text
                                variant="bodyMedium"
                                style={{ textAlign: "center" }}
                              >
                                {actividad.cod_actividad +
                                  " " +
                                  actividad.cod_avance}
                              </Text>
                            </View>
                            <View
                              style={{ backgroundColor: "white", width: 320 }}
                            >
                              <Text variant="bodySmall" style={{}}>
                                {actividad.nom_actividad
                                  ? actividad.nom_actividad
                                  : actividad.des_actividad}
                              </Text>
                            </View>
                            <View
                              style={{ backgroundColor: "white", width: 100 }}
                            >
                              <Text
                                variant="bodyMedium"
                                style={{ textAlign: "center" }}
                              >
                                {actividad.Rendimiento_Aplic}
                              </Text>
                            </View>
                            <View
                              style={{ backgroundColor: "white", width: 100 }}
                            >
                              <Text
                                variant="bodyMedium"
                                style={{ textAlign: "center" }}
                              >
                                {actividad.Rendimiento_Tope}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
        <View style={styles.foot}></View>
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
    justifyContent: "center"
  },
  container: {
    backgroundColor: "#e8e9f1ff",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    width: "100%",
    height: "6%"
  },
  main: {
    width: "100%",
    height: "86%",
    backgroundColor: "#e8e9f1ff",
    display: "flex",
    alignItems: "center"
  },

  tableContainer: {
    width: "100%",
    height: "100%",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: ""
  },

  foot: {
    width: "100%",
    height: "10%",
    backgroundColor: "#e8e9f1ff"
  },
  inputText: {
    backgroundColor: "#e5e9f4ff",
    marginBottom: 10
  },
  tableBody: { width: "100%", height: "95%", backgroundColor: "yellow" }
});
