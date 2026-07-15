import React from "react";
import { Text,TouchableOpacity,View,StyleSheet,Image} from "react-native";
import { IRespuestaObtenerNavesxUsuario } from "../../../src/interfaces/IRespuestaObtenerNavesxUsuario";

type props={
    
    itemNave: IRespuestaObtenerNavesxUsuario;
    onPress: (cod:string, descripcion: string ,isValid : boolean) => void;
    setModalVisible :(value : boolean) => void;
}
export const RenderItemNave = ({ itemNave, onPress, setModalVisible}:props) =>{


    return(
      <View >
       
        <TouchableOpacity style={styles.button} onPress={(()=> {
            onPress(itemNave.cod_nave,itemNave.Descripcion_nave, true);
            setModalVisible(false);
        })}>
           <View style={{flexDirection:"row", alignItems:'center'}}>
                <Image 
                 source={require("../../../assets/hoop-house.png")}
                 style={styles.image}   
                />
            <Text style={styles.textLote}>
                {itemNave.cod_nave}
            </Text>
           </View>
            <Text style={styles.text}>
                {" "}{ itemNave.Descripcion_nave}
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
        padding:10
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