
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


export function useHandleSalir(){
    const {logout} = useContext(AuthContext)

    const HandleSalir = async ()=>{
       // await logout();
    }

    return {HandleSalir}
}