export   interface IAvancesNomina {
    Cod_lote: string,
    Nom_lote:string,
    Cod_nave: string,
    Cod_empleado: string,
    Cod_actividad: string,
    Cod_avance:string,
    Nom_Actividad: string
    Avance: number,
    Rendimiento: number,
    NombreEmpleado: string,
    Seleccionado:number,
    Fecha: string
}

export interface IAvanceUI extends IAvancesNomina {
    existeEnSqlite: boolean
    nom_nave: string
}