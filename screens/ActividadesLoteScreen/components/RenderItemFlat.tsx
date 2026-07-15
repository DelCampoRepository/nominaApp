import React from "react";
import { Text,TouchableOpacity,View,StyleSheet,Image} from "react-native";
import { IListaLotesxUsuario } from "../../../src/interfaces/local/IListaLotesxUsuario";
import { IMainActividades } from "../../../src/interfaces/local/IMainActividades";

type props={
    item: IListaLotesxUsuario;
    onPress: (cod:string, descripcionLote: string,isValid:boolean ) => void;
    setModalVisible :(value : boolean) => void;
}
export const RenderItem = ({item, onPress, setModalVisible}:props) =>{


    return(
      <View style={styles.container}>
       
        <TouchableOpacity style={styles.button} onPress={(()=> {
            onPress(item.cod_lote,item.nom_lote,true);
            setModalVisible(false);
        })}>
           <View style={{flexDirection:"row", alignItems:'center'}}>
                <Image 
                 source={require("../../../assets/land-plots.png")}
                 style={styles.image}   
                />
            <Text style={styles.textLote}>
                {item.cod_lote}
            </Text>
           </View>
            <Text style={styles.text}>
                {" "}{item.nom_lote }
            </Text>
        </TouchableOpacity>
    </View>
    );
 }

 const styles = StyleSheet.create({

    container:{
       
        },
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