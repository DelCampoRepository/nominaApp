import { BarcodeScanningResult } from "expo-camera"
import React from "react"
import {Alert, Linking} from "react-native"

export const handleQrScan = (

    result: BarcodeScanningResult,
    setScanned: React.Dispatch<React.SetStateAction<boolean>>
) =>{

    const {type, data} = result;

    setScanned(true);

    if(data?.startsWith("http")){

        Alert.alert(
            'Qr detectado',
            `Tipo: ${type}\nContenido:\n${data}`,
            [
                {text:"Cancelar", style:"cancel"},
                {text : "Abrir enlace", 
                    onPress: () => Linking.openURL(data).catch(() => Alert.alert("Error", "No se pudo abrir el enlace")),
                },
                {text:"Volver a escanear", onPress: () => setScanned(false)},
            ]
        );
    }

    else{
                Alert.alert(
                    "Qr detectado", 
                    `Tipo ${type}\nContenido:\n${data}`, 
                    [  {text: "Volver a escanear", onPress: () => setScanned(false)},]
                );

    }
}