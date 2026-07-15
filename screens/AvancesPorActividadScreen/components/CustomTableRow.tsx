
import { useState,useRef, useEffect} from "react";
import { StyleSheet,Text,TouchableOpacity ,View, Image} from "react-native"
import { IAvanceEmpleado } from "../../../src/interfaces/local/IAvanceEmpleado";
import { TextInput } from "react-native-gesture-handler";
import { Alert } from "react-native";
type renderRowProps ={
    avance: IAvanceEmpleado;
    setModalVisible: (visible: boolean) => void;
    setDatosEpleado: React.Dispatch<
    React.SetStateAction<{
      codigo: string;
      nombre: string;
    }>
  >;
    
}

export const CustomTableRow = ({ avance,setModalVisible,setDatosEpleado}: renderRowProps) => {




const handleOnButtonPress = () => {
 setDatosEpleado({codigo:avance.cod_empleado,nombre:avance.nom_empleado })
};

    const capitalizar = (texto: string) => {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};


  return (

    <TouchableOpacity
      style={[
        styles.button,
        {
          borderColor: "white",
          backgroundColor:"white",
          flexDirection:'row',
          justifyContent:"space-between"
        }
      ]}
      onPress={ ()=>{ 
        setModalVisible(true);
        handleOnButtonPress();}}
      
    >
        <View style={{width:"100%", padding:10}}>

          <View style={{flexDirection:"row", justifyContent:'space-between', alignItems:"center"}} >
            <View style={{flexDirection:'row', alignItems:'center'}}>
               <Image 
               source={require("../../../assets/account.png")}
               style={styles.image}   
              />
            <Text style={styles.textActividad}>{avance.cod_empleado}</Text>
            </View>
            <Text style={{marginRight:10}}>Avance </Text>
          </View>

          <View style={{flexDirection:"row", justifyContent:"space-between"}}>
            <View style={{}} > 
              <Text style={{marginVertical:"auto", marginLeft: 5 }}>{capitalizar(avance.nom_empleado.toLowerCase())}</Text>
            </View>
            <TextInput 
            placeholder="0" 
            editable={false}
            style={styles.textInput} 
            inputMode="decimal" 
            
            value={String(avance.avanceA)}></TextInput>    
          </View>

        </View>
       
    </TouchableOpacity>

  );
};


const styles = StyleSheet.create({
    button:{
      
       marginTop:5,
        width:"95%",
        borderRadius:5,
        elevation:5,
        backgroundColor:"#f5fff3",
        marginHorizontal:'auto',
       
        borderWidth:1,
       
        marginBottom:5
    },
    textActividad:{
       
        paddingLeft:5,
        fontSize:15,
        color:"#fdac3a",
        fontWeight:'bold'
    },
    textInput:{ marginRight:20, fontSize:24, height:'100%',  width:100,borderRadius:10, fontWeight:"600", color:"#3392f0", textAlign:'right'},
     image:{
        width: 30,
        height: 30, 
         tintColor: "#13c044",   
        marginRight:5,
        marginBottom:5,                                            
    }
});