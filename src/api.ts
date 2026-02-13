import axios from  'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

//http://delcampo.com.mx/WsEmpleadosPideonTest/api/
//"http://delcampo.com.mx/WsEmpleadosPideon/api/"
const api = axios.create({
    baseURL :"http://delcampo.com.mx/WsEmpleadosPideon/api/",

    headers:{
        "Content-Type": "application/json",
    },
    validateStatus: (status) => true,
});


//Buscamos en el AuthContext si  hay un token guardado y si lo hay lo agregamos a las cabeceras de la peticion
api.interceptors.request.use(
  
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    
    
    if (token) {
     
      config.headers.Authorization = `Bearer ${token}`;
      
    }
    return config;
  },
  (error) => {Promise.reject(error)}
);

export default api;

