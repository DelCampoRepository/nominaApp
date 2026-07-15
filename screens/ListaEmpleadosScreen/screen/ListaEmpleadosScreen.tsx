import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, TouchableOpacity, View, Text, Image} from "react-native";
import Header from "../../../src/components/Header";
import { useEffect } from "react";

type Props = NativeStackScreenProps<RootStackParamList, "ListaEmpleados">

export default function ListaEmpleadosScreen({ navigation }: Props) {
 

   useEffect(() => {
    
     }, []);
   

  return (
  <SafeAreaProvider>
    <SafeAreaView style={styles.centeredView}>
        <View style={styles.formContainer}>
         <View style={styles.header}>
            <Header titulo="LISTA DE EMPLEADOS" pantalla="Inicio"/>
         </View>
           <View style={{width:'100%', height:'18%', paddingTop:15}}>

            <TouchableOpacity style={styles.buttonContainer} onPress={() =>{
             
              console.log('asdasd');
            }}>
                <Text  style={styles.text}>{}{" "}{}</Text>
                { ( <Image 
                                 source={require("../../../assets/land-plots.png")}
                                 style={styles.image}   
                                />)}
               
           </TouchableOpacity>

            <TouchableOpacity style={styles.buttonContainer}>
                <Text  style={styles.text}>{}{" "}{}</Text>
                
                {
                   (
                    <Image 
                       source={require("../../../assets/sprout.png")}
                       style={styles.image}   
                     />
                   ) 
                } 

            </TouchableOpacity>
           </View>

       
        </View>
    </SafeAreaView>
  </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
 centeredView: {
    flex: 1,
    backgroundColor:'#e5e9f4ff',
    justifyContent: 'center',
    
  },
  formContainer:{
    width:'100%', 
    height:'100%', 
    backgroundColor:'#e5e9f4ff'
    },
buttonContainer:{
  width:"95%",
  height:50, 
  elevation:5, 
  alignItems:"center", 
  justifyContent:"space-between" ,
  flexDirection:"row", 
  marginHorizontal:'auto',
  backgroundColor:"white", 
  borderRadius:10, 
  marginVertical:5, 
  paddingHorizontal:20},
header:{
  width:'100%',
   height:'7%'},
text:{
  fontSize:14, 
  fontWeight:"bold", 
  color:"#333333"
},
image:{
  width: 30,
  height: 30, 
  tintColor: "#13c044",                                        
}


});