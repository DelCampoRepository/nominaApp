import React, { useState } from 'react';
import {Modal, StyleSheet,Text,View,Pressable,TouchableOpacity} from "react-native";
import { TextInput } from 'react-native-gesture-handler';
import { Alert } from "react-native";
interface props  {
    setAvance:(avance: string)=> void;
    modalVisible:boolean;
    setModalVisible :(value : boolean) => void;
    rendTop:number;
    rendApli:number;
    
   
}

export default function  ModalAgregarAvanceindividual ({setAvance, modalVisible,setModalVisible,rendTop,rendApli}:props){

const [avanceIndi, setAvanceIndi] = useState("");


function Confirmar(text:string ){
    const regex = /^(\d+(\.\d*)?|\.\d*)?$/;
  if (text !== "" && !regex.test(text)) return;

  let valor = parseFloat(text);
  if (isNaN(valor)) valor = 0;

  const valido = valor / Number(rendApli);

  if (valido > rendTop) {
    Alert.alert(
      "Error",
      "Cantidad supera el tope de jornales para esta actividad!"
    );
    return;
  }
    setAvance(avanceIndi);
    setModalVisible(!modalVisible);
}

return(
        
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {setModalVisible(!modalVisible);}}
          
          >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{"Avance"}</Text>
               
                <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>X</Text>
                </Pressable>
                
                <TextInput placeholder="0" style={styles.textInput} inputMode="decimal" onChangeText={(text)=>setAvanceIndi(text)} value={avanceIndi}></TextInput>    
                
                <TouchableOpacity  style={styles.submit} onPress={() =>Confirmar(avanceIndi)}>
                    <Text style={styles.submitText}>Asignar</Text>
                </TouchableOpacity>
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
    height:"44%",
    margin: 20,
    backgroundColor: '#f1fff6',
    borderRadius: 20,
    paddingVertical: 17,
    borderColor:'#13c044',
    borderWidth:2,
    width:"85%",
    
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
    marginTop:20,
    marginBottom: 15,
    textAlign: 'center',
    fontSize:20,fontWeight:'bold'
  }, 
  textInput:{
     minWidth:"50%", 
     textAlign:"center",
     fontSize:24,borderRadius:10,
      fontWeight:"600",
       color:"#3392f0",
       borderBottomWidth:1, 
       backgroundColor:'#ffffff',
        marginHorizontal:'auto',
        marginBottom:10,
        marginTop:10,
        borderWidth:1
  },
    submit:{
        marginTop:10,
        width:"50%",
        height:50,
        borderRadius:10,
        backgroundColor:"#13c044",
        margin:'auto',
        alignItems:'center',
        justifyContent:'center'
    },
    submitText:{
        fontWeight:"600",
        color:'white'
    },
   
});