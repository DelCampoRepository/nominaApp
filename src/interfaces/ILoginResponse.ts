export interface ILoginResponse{
  
    
    estado: number,
    idu_usuario:number,
    mensaje: string,
    nom_usuario:string,
    semana_actual:string
    success: boolean,
    token: {
        expiration: string,
        token:string
    }
   
    user:string
}