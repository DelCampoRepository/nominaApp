import { RootStackParamList } from "../../../types/types";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View, Text} from "react-native";
import Header from "../../../src/components/Header";
import {  useState } from "react";
import { CustomTable } from "../components/CustomTable";

type Props = NativeStackScreenProps<RootStackParamList, "AvancesxActividad">

export default function AvancesxActividadesScreen({
  route,
  navigation
}: Props) {
 
const {
    lote,
    desLote,
    codNave,
    desNave,
    rendApli,
    redTop,
    nomAct,
    coAct,
    codAv,
    unidad
  } = route.params;

  const [totalAvance,setTotalAvance]= useState(0);
  const [totalJornal,setTotalJornal]= useState(0); 
 

  return (
  <SafeAreaProvider>
    <SafeAreaView style={styles.centeredView}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Header titulo="CAPTURA DE AVANCES" pantalla=""/>
          </View>
          <View style={{width:'90%', height:'22%', padding:15, backgroundColor:"white", marginHorizontal:"auto",borderRadius:10}}>
                <Text>Lote: {lote}{" "}{desLote}</Text>
                <Text>Nave: {codNave}{" "}{desNave}</Text>
                <Text>Actividad: {nomAct.toLowerCase()} {" "}{coAct}{"-"}{codAv}</Text>
                <Text>Rendimiento aplicado: {rendApli}</Text>
                <Text>Rendimiento tope: {redTop}</Text>
                <Text>Codigo unidad: {unidad}</Text>
                <Text>Total avances: {totalAvance.toFixed(2)}</Text>
                <Text>Total jornal: {totalJornal.toFixed(2)}</Text>
                
          </View>
            {
              <CustomTable setTotalAvance ={setTotalAvance} setTotalJornal={setTotalJornal} rendApli={rendApli} rendTop={redTop} codLote={lote} codNave={codNave} coAct={coAct} codAv={codAv} desAct={nomAct} descNave={desNave}/>
            } 
            
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

