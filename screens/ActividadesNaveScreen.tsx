import React, { act, useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, IconButton, List, Divider, Button } from "react-native-paper";
import { RootStackParamList } from "../types/types";
import {
  guardarListaActividadesxNave,
  obtenerListaNavesSqlite
} from "../src/services/local/guardarListaDeNavesEnDbLocal";
import { Animated, View, Alert } from "react-native";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { obtenerListaLotesxUsuarioSqLite } from "../src/services/local/guardarListaDeLotesEnDbLocal";
import { IListaLotesxUsuario } from "../src/interfaces/local/IListaLotesxUsuario";
import { obtenerActividadesxLoteSecundariasLocalesSeleccionados } from "../src/services/local/guardarListaDeNavesEnDbLocal";
//import { IRespuestaObtenerNavesxUsuario } from "../src/interfaces/IRespuestaObtenerNavesxUsuario";
import { IActividadesxNave } from "../src/interfaces/local/IActividadesxNave";
import {
  ActualizarAvances,
  actualizarActividadesEnNave,
  GuardarActividadesEnNave,
  SeleccionarActividadesNave,
  EliminarActividadesEnNave,
  obtenerSemanaActivaSqLite,
  Seleccionarllenado,
  SeleccionarActEnNaves,
  actualizarActEnNave
} from "../src/services/sqlite";
import { iNaveSeleccionada } from "../src/interfaces/local/INaveSeleccionada";
import dayjs from "dayjs";
type Props = NativeStackScreenProps<RootStackParamList, "ActividadesNave">;
type Actividad = {
  key: number | string; // debe ser único por fila
  codActividad: string;
  codAvance: string;
  nombreActividad: string;
  isSelected?: boolean; // boolean
};

export default function ActividadesNaveScreen({ navigation }: Props) {
  const fadeAnimInputs = useRef(new Animated.Value(0)).current;
  const translateYInputs = useRef(new Animated.Value(200)).current;
  const fecha = dayjs().format("YYYY-MM-DD");
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

  const [listaLotes, setListaLotes] = useState<IListaLotesxUsuario[]>([]);
  const [ListaNaves, setListaNaves] = useState<any[]>([]);
  const [listaActNave, setListaActNave] = useState<iNaveSeleccionada[]>([]);
  const [terminado, setTerminado] = useState(false);
  const [ListaActividadesSelecc, setListaActividadesSelecc] = useState<any[]>(
    []
  );

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
      //await EliminarActividadesEnNave("22");
      const result = await obtenerListaLotesxUsuarioSqLite();

      setListaLotes(result as IListaLotesxUsuario[]);
    }

    if (listaLotes.length <= 0) obtenerLotes();

    setListaActividadesNave([]);
  }, []);

  //se activa o desactiva al presionar  el encabezado del acordeion de lote
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

  //se activa o desactiva al presionar  el encabezado del acordeion de nave
  useEffect(() => {
    if (datosNave.expandendNave)
      setDatosLote((prev) => ({ ...prev, expandedLote: false }));
  }, [datosNave.expandendNave]);

  useEffect(() => {
    if (datosNave.codNave.trim() !== "") {
      obtenerActividadesSeleccionadas();
    }
    async function obtenerActividadesSeleccionadas() {
      const semana: any = await obtenerSemanaActivaSqLite();

      const seleccion = await SeleccionarActEnNaves(
        datosLote.codLote,
        datosNave.codNave,
        fecha,
        semana[0].semanaActiva
      );

      const filtro = seleccion.filter(
        (res) =>
          res.cod_lote === datosLote.codLote &&
          res.cod_nave === datosNave.codNave
      );
      setListaActividadesSelecc(filtro as any[]);
    }
  }, [datosNave.codNave]);

  useEffect(() => {
    if (terminado) {
      if (listaActividadesNave.length > 0) {
        guardarSeleccion();
      }

      if (listaActNave.length > 0) {
        GuardarActNaeve();
      }

      async function guardarSeleccion() {
        const res = await guardarListaActividadesxNave(listaActividadesNave);
        if (res) {
          Alert.alert("", "Se han guardado las actividades en la nave");
          setListaActNave([]);
        }
      }
      async function GuardarActNaeve() {
        const semana: any = await obtenerSemanaActivaSqLite();
        console.log(datosNave.descripcionNave);
        const filtro: iNaveSeleccionada[] = listaActNave.map((actividad) => ({
          cod_lote: datosLote.codLote,
          cod_nave: actividad.cod_nave,
          desc_nave: actividad.desc_nave,
          cod_actividad: actividad.cod_actividad,
          cod_avance: actividad.cod_avance,
          des_actividad: actividad.des_actividad,
          semanaActiva: semana[0].semanaActiva,
          fecha: fecha,
          seleccionado: actividad.seleccionado
        }));
        console.log("asas", datosNave.descripcionNave);
        const res = await actualizarActEnNave(filtro);
        //const res = await GuardarActividadesEnNave(listaActNave);
        if (true) {
          //  Alert.alert("Se han guardado ");
          setListaActNave([]);
        }
      }
      setTerminado(false);
    }
  }, [terminado]);

  useEffect(() => {}, [listaActividadesNave]);

  useEffect(() => {
    if (terminado) {
    }
  }, [listaActNave]);
  //funcion que se activa al presionar el encabezado del acordeion de nave
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

  //funcion que activa la seleccion del lotem se actualiza el estado de datosLote tras seleccioanr un elemente de la lista de lotes
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
    setListaActividadesSelecc([]);
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

  const handleAsentarActiviadesNave = async () => {
    for (let actividad of ListaActividadesSelecc) {
      if (actividad.seleccionado === 1) {
        setListaActividadesNave((prev) => [
          ...prev,
          {
            cod_lote: datosLote.codLote,
            cod_nave: datosNave.codNave,
            Descripcion_nave: datosNave.descripcionNave,
            cod_actividad: actividad.cod_actividad,
            cod_avance: actividad.cod_avance,
            nom_actividad: actividad.nom_actividad,
            Nom_Corto: ""
          }
        ]);
      }

      const semana: any = await obtenerSemanaActivaSqLite();

      setListaActNave((prev) => [
        ...prev,
        {
          cod_lote: datosLote.codLote,
          cod_nave: datosNave.codNave,
          desc_nave: datosNave.descripcionNave,
          cod_actividad: actividad.cod_actividad,
          cod_avance: actividad.cod_avance,
          des_actividad: actividad.nom_actividad,
          semanaActiva: semana[0].semanaActiva,
          fecha: fecha,
          seleccionado: actividad.seleccionado
        }
      ]);
    }

    setTerminado(true);
    setDatosNave({
      textoNave: "Seleccione Nave",
      codNave: "",
      expandendNave: false,
      descripcionNave: ""
    });
    setListaActividadesSelecc([]);
  };

  // console.log(listaActividadesNave, "lista");
  const handleTouch = (index: number) => {
    setListaActividadesSelecc((prev) => {
      const nuevos = [...prev];

      const actual = nuevos[index];

      nuevos[index] = {
        ...actual,
        seleccionado: actual.seleccionado === 1 ? 0 : 1,
        cod_lote: datosLote.codLote,
        cod_nave: datosNave.codNave,
        Descripcion_nave: datosNave.descripcionNave,
        Nom_Corto: ""
      };

      return nuevos;
    });
  };

  //console.log(ListaActividadesSelecc);

  return (
    <Animated.View style={[styles.AnimatedView, { opacity: fadeAnimInputs }]}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={{ width: "20%" }}>
            <IconButton
              icon={require("../assets/arrow-left.png")}
              iconColor="black"
              size={30}
              onPress={() => navigation.navigate("Inicio")}
              style={{ backgroundColor: "" }}
            />
          </View>
          <View style={{ width: "80%" }}>
            <Text variant="titleSmall" style={{ marginLeft: 45 }}>
              ACTIVIDADES EN NAVE
            </Text>
          </View>
        </View>
        <View style={styles.mainContent}>
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
              <ScrollView style={{ height: 200, backgroundColor: "white" }}>
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
          {datosNave.codNave.trim() !== "" && (
            <View>
              <View style={{ marginTop: 10 }}>
                <View
                  style={{
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    backgroundColor: "#008445",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 10,
                    paddingVertical: 10
                  }}
                >
                  <Text style={{ color: "white" }} variant="titleSmall">
                    Código
                  </Text>
                  <Text style={{ color: "white" }} variant="titleSmall">
                    Descripción
                  </Text>
                  <Text style={{ color: "white" }} variant="titleSmall">
                    Selección
                  </Text>
                </View>
                <ScrollView
                  style={{
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,
                    height: 200
                  }}
                >
                  {ListaActividadesSelecc.map((actividadSecundaria, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        backgroundColor: "white",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 10,
                        paddingVertical: 10
                      }}
                      onPress={() => handleTouch(index)}
                    >
                      <View style={{ width: "20%" }}>
                        <Text variant="bodySmall">
                          {actividadSecundaria.cod_actividad +
                            " " +
                            actividadSecundaria.cod_avance}
                        </Text>
                      </View>
                      <View style={{ width: "63%" }}>
                        <Text variant="bodySmall" style={{ textAlign: "left" }}>
                          {actividadSecundaria.nom_actividad
                            ? actividadSecundaria.nom_actividad
                            : actividadSecundaria.des_actividad}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: "23%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <IconButton
                          icon={
                            actividadSecundaria.seleccionado === 0
                              ? ""
                              : require("../assets/check-bold.png")
                          }
                          key={actividadSecundaria.cod_avance}
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
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={{ marginTop: 40 }}>
                <Button
                  textColor="white"
                  icon="database-arrow-up-outline"
                  style={{}}
                  mode="contained"
                  buttonColor="#008445"
                  onPress={handleAsentarActiviadesNave}
                >
                  Guardar actividades de nave
                </Button>
              </View>
            </View>
          )}
        </View>
        <View style={styles.foot}></View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#e5e9f4ff",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  headerContainer: {
    backgroundColor: "",
    width: "100%",
    height: "6%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  AnimatedView: {
    width: "100%",
    height: "100%",
    marginTop: 30,
    display: "flex",
    justifyContent: "center"
  },
  mainContent: {
    width: "90%",
    height: "84%",
    backgroundColor: ""
  },
  foot: {
    width: "90%",
    height: "10%",
    backgroundColor: ""
  }
});
