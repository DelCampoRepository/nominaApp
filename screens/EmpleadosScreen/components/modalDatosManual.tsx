import React, { useEffect, useState } from 'react';
import {Modal, StyleSheet,Text,View,Pressable, FlatList, Alert, TouchableOpacity} from "react-native";
import { TextInput } from 'react-native-gesture-handler';
import { BuscarEmpleadoPorCodigo } from '../../../src/services/sqlite';
import { Snackbar } from 'react-native-paper';
import { KeyboardAvoidingView } from 'react-native';
interface props  {
    
   
    setModalVisible :(value : boolean) => void;
    modalVisible: boolean;
    handelSubmit: (codigo: string, nombre:string) => void;
    setVisible: (value: boolean) =>void;
    visible : boolean;
}


export default function  ModalDatosManual  ({ setModalVisible,modalVisible,handelSubmit, setVisible, visible}:props){

   
    const [codEmpleado, setCodigoEmpleado] = useState("");
    const [nombre, setNombre] = useState("");
    const onDismissSnackBar = () => setVisible(false);

useEffect(()=>{
    if(codEmpleado.length === 6)
    {
      buscarEmpleado();
    } 
        
    async function buscarEmpleado() {
        
        const res =await BuscarEmpleadoPorCodigo(codEmpleado);
 
        if(res.length === 0)
             {
                Alert.alert("","empleado no econtrado")
                 setCodigoEmpleado("");
                return;
               
             }

        setNombre(res[0].Nom_empleado);
           
    } 
        
    },[codEmpleado])


     

     
    return(
    
         <KeyboardAvoidingView
              behavior={ "padding"}
              style={{ flex: 1 }}>           
              
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {setModalVisible(!modalVisible);}}
          >
          
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View  style={{width:'100%', height:'100%',marginBottom:10, marginTop:20}}>
                 <Text style={styles.modalText}>{"Datos empleado"}</Text>

                <TextInput placeholderTextColor={"gray"}  maxLength={6} keyboardType='numeric' style={styles.TextInput} value={codEmpleado} onChangeText={setCodigoEmpleado}  placeholder="ingresa codigo"/>
                <TextInput placeholderTextColor={"gray"} editable={false} style={styles.TextInput} value={nombre} onChangeText={setNombre} placeholder="nombre"/>
                <TouchableOpacity  style={styles.submit} onPress={()=>{
                     handelSubmit(codEmpleado,nombre);
                     setNombre("");
                     setCodigoEmpleado("");
                     
                }}>
                    <Text style={styles.submitText}>Asignar</Text>
                  </TouchableOpacity>

              </View>
                 <View style={{marginTop:100}}>
                      <Snackbar
                              visible={visible}
                              onDismiss={onDismissSnackBar}
                              duration={300}
                              action={{
                                label: "Ok",
                                onPress: () => {
                                  // Do something
                                }
                              }}
                            >
                              Empleado agreado correctamente
                            </Snackbar>
                 </View>
                <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>X</Text>
              </Pressable>
            </View>
            
          </View>
        </Modal>
              
              </KeyboardAvoidingView>

      
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
    height:"50%",
    
    margin: 20,
    backgroundColor: '#e6f8e6',
    borderRadius: 20,
    paddingVertical: 17,
    borderWidth:2,
    borderColor:"#13c044",
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
    fontWeight:"bold"
  },
  TextInput:{
    fontWeight:"600",
    paddingLeft:10,
    width:"83%",
    height:"20%", 
    marginHorizontal:'auto',
    backgroundColor:"#ffffff", 
    elevation:5,
    borderRadius:10,
    borderWidth:2,
    borderColor:"#a7a7a7",
    marginVertical:5, 
},submit:{
    borderWidth:2,
    borderColor:'#0c8c01',
    marginTop:10,
    width:"80%",
    height:50,
    borderRadius:10,
    backgroundColor:"#70d68d",
    margin:'auto',
    alignItems:'center',
    justifyContent:'center'
    },
    submitText:{
        fontWeight:"600",
        color:'white'
    },
});