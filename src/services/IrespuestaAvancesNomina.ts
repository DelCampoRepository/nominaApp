import {IAvancesNomina} from "../interfaces/IAvancesNomina"
export interface IrespuestaAvancesNomina {

    success: boolean,
    estado: number,
    mensaje: string,
    avances:  IAvancesNomina[]
}