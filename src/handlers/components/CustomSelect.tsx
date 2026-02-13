import React, {useState} from "react";
import {View,Text} from "react-native";
import { Picker } from "@react-native-picker/picker";

type Props = {
  listaItems: Item[];
   onSeleccion: (valor: string) => void;
        // opcional: notificar al padre
};


type Item = {   
  codActividad: string;
  NombreActividad: string;
};

export default function CustomSelect({ listaItems, onSeleccion}: Props) {

const [selectedValue, setSelectedValue] = useState<string>('001');

function handleValueChange(value: string) {
  setSelectedValue(value)
  onSeleccion(value); // notificar al padre

}

return(
    <View style={{}}>
        <Text>Seleciona una opcion:</Text>
        <Picker
            selectedValue={selectedValue}
            onValueChange={(itemValue, itemIndex) =>  handleValueChange(itemValue)}
            style={{height: 55, backgroundColor:"#fdfdfdff", color:"#000000"}}
            >
                {
                    listaItems.map((item, index) => (
                        <Picker.Item key={index} label={item.codActividad + ' ' + item.NombreActividad  } value={item.codActividad} />
                    ))
                }
        
        </Picker>
    </View>
);

}