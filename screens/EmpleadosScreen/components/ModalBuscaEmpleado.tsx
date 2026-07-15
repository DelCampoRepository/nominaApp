import React, { useEffect, useState } from 'react';
import {Modal, StyleSheet,Text,View,Pressable, FlatList} from "react-native";
import { RenderItemNave } from './RenderItemNave';
import { IRespuestaTransferenciaCat } from '../../../src/interfaces/IRespuestaTransferenciaCat1';
import { RenderItemEmpleado } from './RenderItemEmpleado';
import { ConsultarEmpleados, ConsultarEmpleadosxFiltro } from '../../../src/services/local/guardarListaDeEmpleadosEnDbLocal';
import { TextInput } from 'react-native-gesture-handler';

interface props  {
    
   
    setModalVisible :(value : boolean) => void;
    modalVisible: boolean;
    handelSubmit: (codigo: string, nombre:string) => void;
}


export default function  ModalBuscarEmpleados ({ setModalVisible,modalVisible,handelSubmit}:props){
     const [nombrAbuscar, setNombreABuscar] = useState<string>("");
    const [ListaEmpleados, setListaEmpleados] = useState(
        [] as IRespuestaTransferenciaCat[]
      );


    useEffect(() => {
        HandleCarcarListaDeEmpleados();

        async function HandleCarcarListaDeEmpleados() {
                const response = await ConsultarEmpleados();
                setListaEmpleados(response as IRespuestaTransferenciaCat[]);
            }
  }, []);

   const handleBuscarEmpleadoEnListaLocal = async () => {
       const res = await ConsultarEmpleadosxFiltro(nombrAbuscar);
       if (res.length > 0) setListaEmpleados(res as IRespuestaTransferenciaCat[]);
     };
   

     
    return(
    
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {setModalVisible(!modalVisible);}}
          >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View  style={{width:'100%', height:'20%',marginBottom:10}}>
                 <Text style={styles.modalText}>{"Lista de empleados"}</Text>

                <TextInput 
                  onSubmitEditing={handleBuscarEmpleadoEnListaLocal} 
                  style={styles.TextInput} 
                  value={nombrAbuscar} 
                  onChangeText={setNombreABuscar}
                  placeholder="Buscar por nombre"/>
              </  View>
                <View  style={{width:'100%', height:'80%'}}>
                    {ListaEmpleados.length > 0 && 
                    <FlatList
                        data={ListaEmpleados}
                        renderItem={({item}) => <RenderItemEmpleado  itemEmpleado={item}
                         onPress={handelSubmit}  
                            setModalVisible={setModalVisible}/>
                        }
                        keyExtractor={item => `${item.cod_empleado}_${item.Nom_empleado}`}
                    />
               }
                </View>
                <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>X</Text>
              </Pressable>
            </View>
            
          </View>
        </Modal>
      
    );
}


const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#0000005f'
  },
  modalView: {
    height:"80%",
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 17,
    borderWidth:2,
    borderColor:"#70d68d",
    
    width:"95%",
    
    shadowColor: '#000',
    shadowOffset: {
      width:0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius:"50%",
    width:40,
    height:40,
    alignItems:'center',
    justifyContent:'center',
    padding: 10,
    elevation: 2,
    position:'absolute',
    top:5,
    right:5,
    
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#ea644c',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize:20,
    fontWeight:'bold'
  },TextInput:{
    fontWeight:"600",
    paddingLeft:10,
    width:"85%",
    height:"50%", 
    marginHorizontal:'auto',
    backgroundColor:"#ffffff", 
    elevation:5,
    borderRadius:10,
    
    marginVertical:5, 
},
});