import React from 'react';
import { Modal, StyleSheet,Text,View,Pressable, FlatList} from "react-native";
import { IListaLotesxUsuario } from "../../../src/interfaces/local/IListaLotesxUsuario";
import { RenderItemLote } from './RenderItemLote';


interface props  {

    setLote : (codLote: string, descLote: string,isValid: boolean) => void;
   
    lotes:  IListaLotesxUsuario[];
   
    setModalVisible :(value : boolean) => void;
    modalVisible: boolean;
}


export default function  ModalLotes  ({setLote, lotes, setModalVisible,modalVisible}:props){


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
              <Text style={styles.modalText}>{"Lista de lotes"}</Text>
                {lotes.length > 0? (
                      <FlatList
                data={lotes}
                renderItem={({item}) => <RenderItemLote item={item} onPress={setLote}  setModalVisible={setModalVisible} />}
                keyExtractor={item => `${item.cod_lote}_${item.nom_lote}`}
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