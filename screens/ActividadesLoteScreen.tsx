import React, { useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native-paper";
import { RootStackParamList } from "../types/types";

import { View } from "react-native";
import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ScrollView,
  Alert
} from "react-native";
import CustomSelect from "../src/handlers/components/CustomSelect";
//import CustomTable from '../src/handlers/components/CustomTable';

import { Button, IconButton, List } from "react-native-paper";

import { handleQrScan } from "../src/handlers/qrHandler";
import {
  initDB,
  verificarTablas,
  guardarListaActividadesxLote,
  obtenerActividadesxLoteLocales,
  obtenerActividadesxLoteSecundariasLocales,
  actualizar,
  GuardarActividadesEnNave,
  GuardarActEnNaves
} from "../src/services/sqlite";
import { obtenerListaLotesxUsuarioSqLite } from "../src/services/local/guardarListaDeLotesEnDbLocal";
import dayjs from "dayjs";
import { IMainActividades } from "../src/interfaces/local/IMainActividades";
import { ISecundaryActividades } from "../src/interfaces/local/ISecundaryActividades";
import { IListaLotesxUsuario } from "../src/interfaces/local/IListaLotesxUsuario";
import { iNaveSeleccionada } from "../src/interfaces/local/INaveSeleccionada";
import { obtenerSemanaActivaSqLite } from "../src/services/sqlite";
type Props = NativeStackScreenProps<RootStackParamList, "ActividadesLote">;

type PropsTabla = {
  listaActividades: Actividad[];
};

type Actividad = {
  key: number | string; // debe ser único por fila
  codActividad: string;
  codAvance: string;
  nombreActividad: string;
  isSelected?: boolean; // boolean
};

export default function ActividadesLoteScreen({ navigation }: Props) {
  const [codLote, setCodLote] = React.useState<string>("");
  const [expanded, setExpanded] = React.useState(false);
  const [expandedLote, setExpandedLote] = React.useState(false);
  const [actividad, setActividad] = useState("Seleccione actividad");
  const [texLote, setTexLote] = useState("Seleccione Lote");
  const [actividadSeleccionada, setActividadSeleccionad] = useState(false);
  const [mainActividades, setMainActividades] = useState<IMainActividades[]>(
    []
  );
  const [secundaryActividades, setSecundaryActividades] = useState<
    ISecundaryActividades[]
  >([]);
  const fecha = dayjs().format("YYYY-MM-DD");
  const [estado, setEstado] = useState(false);
  /*  useEffect(() => {
    console.log("🔄 Estado actualizado:", secundaryActividades);
  }, [secundaryActividades]);*/

  const [Listalotes, setListaLotes] = useState<IListaLotesxUsuario[]>([]);
  //console.log(JSON.stringify(secundaryActividades, null, 2));
  //cargamos la lista de lotes
  useEffect(() => {
    async function cargarListaLotes() {
      const list = await obtenerListaLotesxUsuarioSqLite();
      setListaLotes(list as IListaLotesxUsuario[]);
    }

    cargarListaLotes();
  }, []);

  //cargamos lista de actividades primarias
  useEffect(() => {
    async function cargarListaActividadesMain() {
      const lista = await obtenerActividadesxLoteLocales(codLote);
      setMainActividades(lista as IMainActividades[]);
    }

    if (codLote.length == 3) {
      cargarListaActividadesMain();
    }
  }, [codLote]);

  useEffect(() => {}, [secundaryActividades]);

  //obtenemos la lista de actividades secundarias
  const handlePressoption = (codActividad: string, descripcion: string) => {
    setActividad(codActividad + " " + descripcion);
    setActividadSeleccionad(true);

    setExpanded(false);

    async function obtenerListaSecundaria() {
      const listaSecundaria = await obtenerActividadesxLoteSecundariasLocales(
        codLote,
        codActividad
      );

      setSecundaryActividades(listaSecundaria as ISecundaryActividades[]);
    }
    obtenerListaSecundaria();
  };

  const handleSeleccionLote = (codLote: string, nomLote: string) => {
    setTexLote(codLote + " " + nomLote);
    setExpandedLote(false);
    setCodLote(codLote);
  };

  //FUNCION QUE CONTROLA LOS CHECKBOXES DE LA TABLA

  const handlePress = () => {
    if (codLote.length === 0) {
      Alert.alert("", "Ingrese  codigo de lote antes de seleccion");
      return;
    }
    setExpanded(!expanded);
    setExpandedLote(false);
  };

  const handlePressLoteList = () => {
    setExpandedLote(!expandedLote);
    setExpanded(false);
  };

  const handleTouch = (index: number) => {
    console.log(index);
    setEstado(!estado);

    setSecundaryActividades((prev) => {
      const nuevos = [...prev];

      const actual = nuevos[index];

      nuevos[index] = {
        ...actual,
        selecionado: actual.selecionado === 0 ? 1 : 0
      };

      return nuevos;
    });
  };

  const handleAsnetar = async () => {
    const resp = await actualizar(codLote, secundaryActividades);

    const actNave = secundaryActividades
      .filter((actividad) => actividad.selecionado === 1)
      .map((actividad, index) => {
        return actividad;
      });

    const semana: any[] = await obtenerSemanaActivaSqLite();

    const guarda = await GuardarActEnNaves(
      codLote,
      fecha,
      semana[0].semanaActiva
    );
    if (resp) Alert.alert("", "Se han asentado las actividades seleccionadas");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.redBox}>
        <View
          style={{
            display: "flex",
            backgroundColor: "",
            flexDirection: "row",
            width: "100%",
            height: "5%",
            marginTop: 40
          }}
        >
          <View
            style={{
              width: "10%",
              display: "flex",
              backgroundColor: "",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <IconButton
              icon={require("../assets/arrow-left.png")}
              iconColor="black"
              size={30}
              onPress={() => navigation.navigate("Inicio")}
              style={{ backgroundColor: "" }}
            />
          </View>
          <View
            style={{
              width: "90%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text
              variant="titleSmall"
              style={{ marginTop: 0, marginRight: 20, textAlign: "center" }}
            >
              ACTIVIDADES EN LOTE
            </Text>
          </View>
        </View>

        <View
          style={{
            width: "100%",
            marginTop: 10,
            height: "30%"
          }}
        >
          <List.Section title="" style={{ borderRadius: 5 }}>
            <List.Accordion
              title={texLote}
              expanded={expandedLote}
              onPress={handlePressLoteList}
            >
              <ScrollView
                style={{
                  backgroundColor: "white",
                  height: "60%",
                  marginBottom: 10
                }}
              >
                {Listalotes.map((lote, index) => (
                  <List.Item
                    key={index}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={require("../assets/land-plots.png")}
                      />
                    )}
                    title={lote.cod_lote + " " + lote.nom_lote}
                    onPress={() => {
                      handleSeleccionLote(lote.cod_lote, lote.nom_lote);
                    }}
                  />
                ))}
              </ScrollView>
            </List.Accordion>
          </List.Section>
          <List.Section title="" style={{ borderRadius: 5 }}>
            <List.Accordion
              title={actividad}
              expanded={expanded}
              onPress={handlePress}
            >
              <ScrollView
                style={{
                  backgroundColor: "white",
                  height: "60%",
                  marginBottom: 10
                }}
              >
                {mainActividades.map((actividad, index) => (
                  <List.Item
                    key={index}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={require("../assets/sprout.png")}
                      />
                    )}
                    title={
                      actividad.cod_actividad + " " + actividad.nom_actividad
                    }
                    onPress={() => {
                      handlePressoption(
                        actividad.cod_actividad,
                        actividad.nom_actividad
                      );
                    }}
                  />
                ))}
              </ScrollView>
            </List.Accordion>
          </List.Section>
          {codLote && actividadSeleccionada && (
            <View
              style={{
                backgroundColor: "",
                width: "100%",
                height: "100%",
                marginTop: 10
              }}
            >
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
                  Descripción actividad
                </Text>
                <Text style={{ color: "white" }} variant="titleSmall">
                  Selección
                </Text>
              </View>
              <ScrollView
                style={{
                  borderBottomLeftRadius: 5,
                  borderBottomRightRadius: 5
                }}
              >
                {secundaryActividades.map((actividadSecundaria, index) => (
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
                    onPress={() => {
                      handleTouch(index);
                    }}
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
                        {actividadSecundaria.nom_actividad}
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
                          actividadSecundaria.selecionado === 0
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
          )}
          {codLote && actividadSeleccionada && (
            <Button
              textColor="white"
              icon="database-arrow-up-outline"
              style={{ marginTop: 20 }}
              mode="contained"
              buttonColor="#008445"
              onPress={handleAsnetar}
            >
              Asentar actividades
            </Button>
          )}
        </View>
      </View>
      <View />
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1, // ocupa toda la pantalla
    backgroundColor: "#e8e9f1ff",
    justifyContent: "center",
    alignItems: "center"
  },
  redBox: {
    flex: 20, // visible
    width: "90%" // ajustable
  }
});
