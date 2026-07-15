import React from "react";
import { Text,TouchableOpacity,View,StyleSheet,Image} from "react-native";
import { IListaLotesxUsuario } from "../../../src/interfaces/local/IListaLotesxUsuario";
import { IMainActividades } from "../../../src/interfaces/local/IMainActividades";

type props={
    
    itemActividad: IMainActividades;
    onPress: (cod:string, descripcion: string ,isValid : boolean) => void;
    setModalVisible :(value : boolean) => void;
}
export const RenderItemActividad = ({ itemActividad, onPress, setModalVisible}:props) =>{


    return(
      <View >
       
        <TouchableOpacity style={styles.button} onPress={(()=> {
            onPress(itemActividad.cod_actividad,itemActividad.nom_actividad, true);
            setModalVisible(false);
        })}>
           <View style={{flexDirection:"row", alignItems:'center'}}>
                <Image 
                 source={require("../../../assets/sprout.png")}
                 style={styles.image}   
                />
            <Text style={styles.textLote}>
                {itemActividad.cod_actividad}
            </Text>
           </View>
            <Text style={styles.text}>
                {" "}{ itemActividad.nom_actividad}
            </Text>
        </TouchableOpacity>
    </View>
    );
 }

 const styles = StyleSheet.create({

   
    button:{
        width:"90%",
        elevation:5, 
        marginHorizontal:'auto',
        backgroundColor:"white", 
        borderRadius:10, 
        marginVertical:6, 
        padding:10,
        borderWidth:1
    },
    text:{
          marginBottom:5,         
          fontSize:16
    },
    textLote:{
        fontWeight:500 ,
        marginBottom:5,
        fontSize:24,
        color:'#fdac3a',
    },
     image:{
        width: 30,
        height: 30, 
        tintColor: "#13c044",
        marginRight:5,
        marginBottom:5,                                            
    }
 })