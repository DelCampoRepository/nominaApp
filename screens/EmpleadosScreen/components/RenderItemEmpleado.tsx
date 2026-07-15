import React from "react";
import { Text,TouchableOpacity,View,StyleSheet,Image} from "react-native";
import { IRespuestaTransferenciaCat } from "../../../src/interfaces/IRespuestaTransferenciaCat1";

type props={
    
    itemEmpleado: IRespuestaTransferenciaCat;
    onPress: (codigo: string, nombre:string) => void;
    setModalVisible :(value : boolean) => void;
}
export const RenderItemEmpleado = ({ itemEmpleado, onPress, setModalVisible}:props) =>{


    return(
      <View >
       
        <TouchableOpacity style={styles.button} onPress={(()=> {
            onPress(itemEmpleado.cod_empleado, itemEmpleado.Nom_empleado);
            setModalVisible(false);
        })}>
           <View style={{flexDirection:"row", alignItems:'center'}}>
                <Image 
                 source={require("../../../assets/account.png")}
                 style={styles.image}   
                />
            <Text style={styles.textLote}>
                {itemEmpleado.cod_empleado}
            </Text>
           </View>
            <Text style={styles.text}>
                {" "}{ itemEmpleado.Nom_empleado}
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
        borderWidth:1,
        borderColor:'black'
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