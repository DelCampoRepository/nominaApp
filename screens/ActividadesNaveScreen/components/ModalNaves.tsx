import React, {} from 'react';
import {Modal, StyleSheet,Text,View,Pressable, FlatList} from "react-native";
import { RenderItemNave } from './RednerItemNave';
import { IRespuestaObtenerNavesxUsuario } from '../../../src/interfaces/IRespuestaObtenerNavesxUsuario';

interface props  {
    setNave:(codNave: string, desNave:string,isValid : boolean)=> void;
    naves : IRespuestaObtenerNavesxUsuario[];
    setModalVisible :(value : boolean) => void;
    modalVisible: boolean;
}




export default function  ModalNaves ({naves, setNave, setModalVisible,modalVisible}:props){


    return(
        
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {setModalVisible(!modalVisible);}}
          
          >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{"Lista de naves"}</Text>
                {naves.length > 0 && 
                    <FlatList
                        data={naves}
                        renderItem={({item}) => <RenderItemNave  itemNave={item} onPress={setNave}  setModalVisible={setModalVisible}/>}
                        keyExtractor={item => `${item.cod_nave}_${item.Descripcion_nave}`}
                    />
               }
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
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 17,

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
    fontSize:20
  },
});