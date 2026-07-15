import React from "react";
import { Text,TouchableOpacity,View,StyleSheet,Image} from "react-native";

type props={
    item: string;
    onPress: (jefe: string) => void;
    setModalVisible :(value : boolean) => void;
}
export const RenderItemFiltro = ({item, onPress, setModalVisible}:props) =>{


    return(
      <View style={styles.container}>
       
        <TouchableOpacity style={styles.button} onPress={(()=> {
            onPress(item);
            setModalVisible(false);
        })}>
           <View style={{flexDirection:"row", alignItems:'center'}}>
                <Image 
                 source={require("../../../assets/hoop-housew.png")}
                 style={styles.image}   
                />
            <Text style={styles.textLote}>
                {item}
            </Text>
           </View>
            
        </TouchableOpacity>
    </View>
    );
 }

 const styles = StyleSheet.create({

    container:{
        width:'50%',
    
        
        },
    button:{
        width:"50%",
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