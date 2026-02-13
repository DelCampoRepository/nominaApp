export interface  IEmpleadosParaAsentar{

    cod_lote : string,
    cod_nave : string,
    wDatos: IWDatos []
}


export interface IWDatos{
    cod_act: string,
    cod_avn: string,
    cod_emp: string,
    avances: string,
    bandera : string,
    avancesA: string,
    rendAplicado: number,
    estadoSincro: number,
    MensajeSincro: number
}

export interface  IHeaderReporte{
    cod_act: string,
    cod_avn: string,
    desc_actividad: string,
    totalAv : number,
    totalJor: number
    subRpt : subReporte[];
}

export interface subReporte{
 avances: string,
avancesA: string,
cod_emp: string,
nombreEmpl: string,
jornal: string,
estadoSincro: number,
Rendimiento_Aplic: number,
MensajeSincro: string,


}


