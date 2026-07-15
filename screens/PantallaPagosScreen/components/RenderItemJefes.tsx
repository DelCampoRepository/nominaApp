import React from "react";
import { Text,TouchableOpacity,View,StyleSheet,Image} from "react-native";

import { IJefeNave } from "../../../src/interfaces/local/IJefeNave";
type props={
    item: IJefeNave;
    onPress: (jefe: IJefeNave) => void;
    setModalVisible :(value : boolean) => void;
}
export const RenderItemJefe = ({item, onPress, setModalVisible}:props) =>{


    return(
      <View style={styles.container}>
       
        <TouchableOpacity style={styles.button} onPress={(()=> {
            onPress(item);
            setModalVisible(false);
        })}>
           <View style={{flexDirection:"row", alignItems:'center'}}>
                <Image 
                 source={require("../../../assets/account-cowboy-hat.png")}
                 style={styles.image}   
                />
            <Text style={styles.textLote}>
                {item.Cod_jefe_nave}
            </Text>
           </View>
            <Text style={styles.text}>
                {" "}{item.NombreJefeNave }
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
        padding:10
    },
    text:{
          marginBottom:5,         
          fontSize:16
    },
    textLote:{
        fontWeight:500 ,
        marginBottom:5,
        fontSize:23,
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