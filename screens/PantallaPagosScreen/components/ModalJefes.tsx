import React from 'react';
import { Modal, StyleSheet,Text,View,Pressable, FlatList} from "react-native";
import { IJefeNave } from '../../../src/interfaces/local/IJefeNave';
import { RenderItemJefe } from './RenderItemJefes';



interface props  {

    setModalVisible :(value : boolean) => void;
    modalVisible: boolean;
    listaJefes: IJefeNave[];
    setJefeSeleccionado: (jefe: IJefeNave) => void;
}


export default function  ModalJefes({ setModalVisible,modalVisible, listaJefes,setJefeSeleccionado}:props){


    return(
        
   
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {setModalVisible(!modalVisible);}}
          style={{}}
          >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{"Lista de jefes"}</Text>
             {listaJefes.length > 0? (
                      <FlatList
                data={listaJefes}
                renderItem={({item}) => <RenderItemJefe item={item} onPress={setJefeSeleccionado}  setModalVisible={setModalVisible} />}
                keyExtractor={item => `${item.Cod_jefe_nave}_${item.NombreJefeNave}`}
                />
                ):(
                      <></>
                )}
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

/*
       
*/

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:'#0000005f'
  },
  modalView: {
   
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