import React, { useState, useEffect, useRef } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { View } from "react-native";
import { Text, List, Divider } from "react-native-paper";
import {
  StyleSheet,
  ScrollView,
  Animated
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../src/components/Header";
import { obtenerListaNavesSqlite } from "../src/services/local/guardarListaDeNavesEnDbLocal";
import { IListaLotesxUsuario } from "../src/interfaces/local/IListaLotesxUsuario";
import { obtenerListaLotesxUsuarioSqLite } from "../src/services/local/guardarListaDeLotesEnDbLocal";
import { IActividadesxNave } from "../src/interfaces/local/IActividadesxNave";

import dayjs from "dayjs";
import {
  obtenerSemanaActivaSqLite,
  SeleccionarAvancesEmpleadosASyncronizar
} from "../src/services/sqlite";
import { IHeaderReporte } from "../src/interfaces/IEmpleadosParaAsentar";
import { ConsultarSemanaActiva } from "../src/utils/ObtenerSemanaActiva";
type Props = NativeStackScreenProps<RootStackParamList, "ReporteAvances">;

export default function ReporteAvancesScreen({ navigation }: Props) {
  const [datosLote, setDatosLote] = useState({
    textoLote: "Seleccione Lote",
    codLote: "",
    expandedLote: false,
    descripcionLote: ""
  });

  const [datosNave, setDatosNave] = useState({
    textoNave: "Seleccione Nave",
    codNave: "",
    expandendNave: false,
    descripcionNave: ""
  });
  const [totales, setTotales] = useState({
    totalAvance: 0,
    totalJornal: 0
  });
  const [listaLotes, setListaLotes] = useState<IListaLotesxUsuario[]>([]);
  const [ListaNaves, setListaNaves] = useState<any[]>([]);
  const fadeAnimInputs = useRef(new Animated.Value(0)).current;
  const translateYInputs = useRef(new Animated.Value(200)).current;
  const fecha = dayjs().format("YYYY-MM-DD");
  const [datosReporte, setDatosReporte] = useState<IHeaderReporte[]>([]);
  const [listaActividadesNave, setListaActividadesNave] = useState<
    IActividadesxNave[]
  >([]);

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
    async function obtenerLotes() {
      const result = await obtenerListaLotesxUsuarioSqLite();

      setListaLotes(result as IListaLotesxUsuario[]);
    }

    if (listaLotes.length <= 0) obtenerLotes();

    setListaActividadesNave([]);
  }, []);

  useEffect(() => {
    async function obtenerNaves() {
      const listaNaves = await obtenerListaNavesSqlite(datosLote.codLote);
      setListaNaves(listaNaves as any[]);
    }

    if (datosLote.codLote.trim() !== "") obtenerNaves();
  }, [datosLote.codLote]);

  useEffect(() => {
    if (datosNave.codNave !== "") {
      consulta();
    }

    async function consulta() {
      const semana = await ConsultarSemanaActiva();
      console.log("semana activa", semana);
      const datos = await SeleccionarAvancesEmpleadosASyncronizar(
        semana,
        fecha
      );

      console.log("datos avance", datos);
      console.log(datosLote.codLote, datosNave.codNave);
      const datosAmostrar = datos.filter(
        (res) =>
          res.cod_lote === datosLote.codLote &&
          res.cod_nave === datosNave.codNave &&
          Number(res.avance) !== 0 &&
          Number(res.avanceA) !== 0
      );
      console.log("aa", datosAmostrar);
      const Registros = new Map<string, IHeaderReporte>();

      //por cada empleado en la lista
      for (const actividad of datosAmostrar) {
        const { cod_actividad, cod_avance, des_actividad } = actividad;
        const clave = `${cod_actividad}_${cod_avance}`;

        // Si no existe, se crea una nueva actividad
        if (!Registros.has(clave)) {
          Registros.set(clave, {
            cod_act: cod_actividad,
            cod_avn: cod_avance,
            desc_actividad: des_actividad,
            totalAv: 0,
            totalJor: 0,
            subRpt: []
          });
        }

        const act = Registros.get(clave)!;

        // Acumulamos los totales
        act.totalAv += Number(actividad.avance);
        act.totalJor +=
          parseFloat(actividad.avance) / Number(actividad.Rendimiento_Aplic);

        // Agregamos el detalle
        act.subRpt.push({
          avances: parseFloat(actividad.avance).toFixed(2),
          avancesA: parseFloat(actividad.avanceA ?? 0).toFixed(2),
          cod_emp:
            actividad.cod_empleado.substring(
              0,
              actividad.cod_empleado.length - 1
            ) +
            "-" +
            actividad.cod_empleado.substring(
              actividad.cod_empleado.length - 1,
              actividad.cod_empleado.length
            ),
          nombreEmpl: actividad.nom_empleado,
          jornal: (
            parseFloat(actividad.avance) / Number(actividad.Rendimiento_Aplic)
          ).toFixed(2),
          estadoSincro: actividad.estadoSincro,
          Rendimiento_Aplic: actividad.Rendimiento_Aplic,
          MensajeSincro: String(actividad.MensajeSincro ?? "")
        });

        // Actualiza la clave actual
      }

      const avancesXactividad: IHeaderReporte[] = Array.from(
        Registros.values()
      );

      //console.log("para filtro", JSON.stringify(avancesXactividad, null, 2));
      setDatosReporte(avancesXactividad);

      // const  elementoLista = Registros.get( cod_avn)!;
    }
  }, [datosNave.codNave]);

  const handleLoteSeleccion = (codLote: string, textoLote: string) => {
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

  const handleNaveSeleccion = (codNave: string, textoNave: string) => {
    setDatosNave((prev) => ({
      ...prev,
      codNave: codNave,
      textoNave: codNave + " " + textoNave,
      expandendNave: false,
      descripcionNave: textoNave
    }));
  };

  return (
    <Animated.View style={styles.AnimatedView}>
      <SafeAreaView>
        <View style={styles.header}>
          <Header titulo={"REPORTE DE AVANCES"} pantalla="Inicio" />
        </View>
        <View style={styles.main}>
          <View
            style={{
              width: "90%",
              display: "flex",
              marginHorizontal: "auto",
              justifyContent: "center",
              backgroundColor: "",
              marginTop: 10
            }}
          >
            <ScrollView>
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

              <View
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "",
                  marginHorizontal: "auto",
                  paddingTop: 40
                }}
              >
                <ScrollView horizontal>
                  <View>
                    {datosReporte.map((item, index) => (
                      <View key={index}>
                        <Text variant="bodyMedium">
                          {" "}
                          {item.cod_act +
                            " " +
                            item.cod_avn +
                            " " +
                            item.desc_actividad}
                        </Text>
                        <View>
                          <ScrollView>
                            <View
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <View
                                style={{
                                  width: 40,
                                  backgroundColor: "#3e8e4a",
                                  borderTopLeftRadius: 5
                                }}
                              >
                                <Text
                                  style={{
                                    color: "white",
                                    textAlign: "center"
                                  }}
                                  variant="bodySmall"
                                >
                                  AVN.
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: 40,
                                  backgroundColor: "#3e8e4a"
                                }}
                              >
                                <Text
                                  style={{
                                    color: "white",
                                    textAlign: "center"
                                  }}
                                  variant="bodyMedium"
                                >
                                  JRN.
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: 150,
                                  backgroundColor: "#3e8e4a"
                                }}
                              >
                                <Text
                                  style={{
                                    color: "white",
                                    textAlign: "center"
                                  }}
                                  variant="bodyMedium"
                                >
                                  COD. EMPLEADO
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: 250,
                                  backgroundColor: "#3e8e4a"
                                }}
                              >
                                <Text
                                  style={{ color: "white", textAlign: "left" }}
                                  variant="bodyMedium"
                                >
                                  NOMBRE
                                </Text>
                              </View>
                              <View
                                style={{
                                  width: 500,
                                  backgroundColor: "#3e8e4a",
                                  borderTopRightRadius: 5
                                }}
                              >
                                <Text
                                  style={{ color: "white", textAlign: "left" }}
                                  variant="bodyMedium"
                                >
                                  ESTADO
                                </Text>
                              </View>
                            </View>

                            <View>
                              {item.subRpt.map((avance, index) => (
                                <View
                                  key={index}
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center"
                                  }}
                                >
                                  <View
                                    style={{
                                      width: 40,
                                      backgroundColor:
                                        avance.estadoSincro === 0
                                          ? "rgb(216, 74, 74)"
                                          : "green"
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "white",
                                        textAlign: "center"
                                      }}
                                      variant="bodySmall"
                                    >
                                      {Number(avance.avances).toFixed(2) + " "}
                                    </Text>
                                  </View>

                                  <View
                                    style={{
                                      width: 40,
                                      backgroundColor:
                                        avance.estadoSincro === 0
                                          ? "rgb(216, 74, 74)"
                                          : "green"
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "white",
                                        textAlign: "center"
                                      }}
                                      variant="bodySmall"
                                    >
                                      {avance.jornal + " "}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      width: 150,
                                      backgroundColor:
                                        avance.estadoSincro === 0
                                          ? "rgb(216, 74, 74)"
                                          : "green"
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "white",
                                        textAlign: "center"
                                      }}
                                      variant="bodySmall"
                                    >
                                      {avance.cod_emp + " "}
                                    </Text>
                                  </View>

                                  <View
                                    style={{
                                      width: 250,
                                      backgroundColor:
                                        avance.estadoSincro === 0
                                          ? "rgb(216, 74, 74)"
                                          : "green"
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "white",
                                        textAlign: "left"
                                      }}
                                      variant="bodySmall"
                                    >
                                      {avance.nombreEmpl + " "}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      width: 500,
                                      backgroundColor:
                                        avance.estadoSincro === 0
                                          ? "rgb(216, 74, 74)"
                                          : "green"
                                    }}
                                  >
                                    <Text
                                      style={{
                                        color: "white",
                                        textAlign: "left"
                                      }}
                                      variant="bodySmall"
                                    >
                                      {avance.MensajeSincro === ""
                                        ? "NO SINCRONIZADO"
                                        : avance.MensajeSincro}
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          </ScrollView>
                        </View>
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            marginBottom: 30,
                            marginTop: 5
                          }}
                        >
                          <Text
                            variant="bodyMedium"
                            style={{ marginRight: 20 }}
                          >
                            Total Avance: {item.totalAv.toFixed(2)}
                          </Text>
                          <Text variant="bodyMedium">
                            Total Jornal: {item.totalJor.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </ScrollView>
          </View>
        </View>
        <View style={styles.footer}>
          <View></View>
          <View></View>
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
    backgroundColor: "",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  headerReporte: {
    width: "100%",
    height: 25,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    backgroundColor: "",
    flexDirection: "column"
  }
});
