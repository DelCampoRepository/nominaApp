export type RootStackParamList = {
  Inicio: undefined;
  Escaner: undefined;
  Empleados: undefined;
  Login: undefined;
  ListaEmpleados: undefined;
  ListaNaves: undefined;
  ActividadesLote: undefined;
  ActividadesNave: undefined;
  ReporteAvances: undefined;
  Transferir: undefined;
  Avances: undefined;
  Loading: {
    nomUsuario: string;
    semanaActiva: string;
    iduUser: number;
  };
  AvancesxActividad: {
    lote: string;
    desLote: string;
    codNave: string;
    desNave: string;
    rendApli: number;
    redTop: number;
    nomAct: string;
    coAct: string;
    codAv: string;
    rednApl: number;
    unidad: string;
  };
  Pagos: undefined;

  Header: { headerText: string; navigateTo: string };
};
