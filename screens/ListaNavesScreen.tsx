import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, IconButton, Text, TextInput, DataTable, Appbar } from "react-native-paper";
import { View, TouchableOpacity , StyleSheet} from "react-native";
import { useNave } from "../src/context/NaveContext";
type Props = NativeStackScreenProps<RootStackParamList, "ListaNaves">;

export default function ListaNavesScreen({navigation} : Props){
  const [codNave, setCodNave] = React.useState<string>("");
  const [Descripcion, setDescripcion] = React.useState<string>("");
  const { setCodNave: setCodNaveContext } = useNave();
 
  const [page, setPage] = React.useState<number>(0);
  const [numberOfItemsPerPageList] = React.useState([5,3]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(
     numberOfItemsPerPageList[0]
   );
 
   
   const [items] = React.useState([
    {
      key: 1,
       codNave: 'A1',
       Descripcion: 'NAVE A1',
 
    },
    {
       key: 2,
         codNave: 'A2',
         Descripcion: 'NAVE A2',
    },
    {
      key: 3,
       codNave: 'A3',
       Descripcion: 'NAVE A3',
    },
    {
      key: 4,
       codNave: 'B1',
       Descripcion: 'NAVE B1',
    },
   ]);
   


 
   const from = page * itemsPerPage;
   const to = Math.min((page + 1) * itemsPerPage, items.length);
 
   React.useEffect(() => {
     setPage(0);
   }, [itemsPerPage]);


function handleNaveSelecion(codNave: string, descripcion: string) {
    setCodNave(codNave);
    setDescripcion(descripcion)
}

function handleAceptar() {
setCodNaveContext(codNave);
  navigation.navigate("Empleados")
}

  return (
  
  <LinearGradient style={styles.container}  colors={['#f0fff0', '#B3E0B3', '#9fc79fff']}>
 <View style={{width:'100%', height:"15%", marginBottom:15}}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => navigation.navigate('Empleados')} />
                    <Appbar.Content style={{alignItems:'center', marginRight:50}}  title="Lista De Naves" />
                </Appbar.Header>
            </View>
      <View style={{width: "100%", height:"85%"}}>
        <View style={styles.tablaContainer}>
                <DataTable style={{ backgroundColor:"#f2f2f2cc" , height:"100%"}}>
              <DataTable.Header style={{backgroundColor:"#c4c4c7cc"}}  >
            
                <DataTable.Title >Cod. Nave</DataTable.Title>
                 <DataTable.Title >Nombre Nave</DataTable.Title>
                    
              </DataTable.Header>

          {items.slice(from, to).map((item) => (
            <DataTable.Row key={item.key}>
              <DataTable.Cell onPress={() =>{handleNaveSelecion(item.codNave, item.Descripcion)}}>{item.codNave}</DataTable.Cell>
              <DataTable.Cell >{item.Descripcion}</DataTable.Cell> 
             
            </DataTable.Row>
          ))}

          <DataTable.Pagination
            page={page}
            numberOfPages={Math.ceil(items.length / itemsPerPage)}
            onPageChange={(page) => setPage(page)}
            label={`${from + 1}-${to} of ${items.length}`}
          
            numberOfItemsPerPage={itemsPerPage}
            onItemsPerPageChange={onItemsPerPageChange}

            selectPageDropdownLabel={'Rows per page'}
          />
        </DataTable>
      </View>
      <View  style={{width: '100%', height: '20%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <View style={{marginBottom:0, marginTop:10, display:'flex', flexDirection:'row', justifyContent:'space-around', width:"100%"}}>
           <View>
               <Text variant="bodySmall">Cod. Nave:</Text>
             <TextInput
                      value={codNave}
                      onChangeText={(text: string) => setCodNave(text)}
                      mode='outlined'
                      maxLength={3}
                      style={{width:100, backgroundColor:"#ffffffcc"}}
                  />
           </View>
                    <View>
                         <Text variant="bodySmall">Descripcion:</Text>
                      <TextInput
                      value={Descripcion}
                      onChangeText={(text:string) => setCodNave(text)}
                      mode='outlined'
                    
                      style={{width:270, backgroundColor:"#ffffffcc"}}
                  />
                    </View>
        </View>
       <View style={{width:"100%", display:'flex', alignItems:'center', justifyContent:'space-around', marginTop:5}}>
         <TouchableOpacity style={styles.botonCuadrado} onPress={() => handleAceptar()}>
          <Text variant="bodySmall">Aceptar</Text>
          </TouchableOpacity>
       </View>
      </View>
      </View>

  </LinearGradient>
  
);

}



const styles = StyleSheet.create({

    container: {
    width: '100%',
      height: '100%',
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center',
    },
   tablaContainer:{
    width: '100%', 
    height: '45%',
     display: 'flex',
      alignItems: 'center', 
      justifyContent: 'center', 
   },
    
    botonCuadrado: {
      width: 100,
      height: 40,
      borderRadius: 8,
      
  display:'flex',
   flexDirection:"row",
    alignItems:'center',
     justifyContent:'center',
      backgroundColor:"#f0fffeff" ,
      marginTop:20,
  },

});