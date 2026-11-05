import { useEffect, useState } from "react";
import { StyleSheet, View, Text, Button, Alert } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraType,
  type BarcodeScanningResult
} from "expo-camera";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { useEmployee } from "../src/context/QrContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../src/components/Header";
import { buscarNombreEmpleado } from "../src/services/sqlite";

type Props = NativeStackScreenProps<RootStackParamList, "Escaner">;

export default function QrScannerScreen({ navigation }: Props) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { setEmployeeCode, employeeCode, setNombreEmpleado } = useEmployee();

  if (!permission)
    return (
      <View style={styles.center}>
        <Text>Cargando permisos…</Text>
      </View>
    );

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Se requiere permiso de cámara</Text>
        <Button title="Conceder permiso" onPress={requestPermission} />
        <Button title="Volver" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const onScan = async (res: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    const cod = res.data.substring(0, 6);
    const nom: any[] | undefined = await buscarNombreEmpleado(cod);
    // Si el código no está en la lista local se avisa y se permite escanear de
    // nuevo (antes nom[0] era undefined y la app se cerraba).
    if (!nom || nom.length === 0) {
      Alert.alert(
        "Empleado no encontrado",
        `El código ${cod} no está en la lista de empleados. Sincroniza Empleados o verifica la credencial.`,
        [{ text: "Escanear otra vez", onPress: () => setScanned(false) }]
      );
      return;
    }
    setEmployeeCode(cod);
    setNombreEmpleado(nom[0].Nom_empleado);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          width: "100%",
          height: "10%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white"
        }}
      >
        <Header titulo="ESCANER CREDENCIAL EMPLEADO" pantalla="" />
      </View>
      <View style={{ width: "100%", height: "70%" }}>
        <CameraView
          style={[
            StyleSheet.absoluteFill,
            { marginHorizontal: 50, marginVertical: 150, borderRadius: 40 }
          ]}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : onScan}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
      </View>
      <View style={{ height: "20%", width: "100%" }}></View>
      <View style={styles.bottom}>
        <Text style={styles.tip}>
          {scanned ? "Procesando…" : "Apunta al QR"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  bottom: {
    height: "20%",
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "#e8e9f1ff",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    flex: 1, // ocupa toda la pantalla
    backgroundColor: "#e8e9f1ff",
    justifyContent: "center",
    alignItems: "center"
  },
  tip: { color: "#000000ff", fontSize: 16 }
});
