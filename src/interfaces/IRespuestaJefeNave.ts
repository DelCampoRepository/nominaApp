import { IJefeNave } from "./local/IJefeNave";
export interface IRespuestaJefesNave{

     success: boolean,
     estado: number,
     mensaje: string,

    jefesDeNave: IJefeNave[]
}