import React, { createContext, useContext, useMemo, useState } from "react";
import { IEmpleadoCapturado } from "../interfaces/local/IEmpleadoCapturado";

// Define el tipo del contexto
type UsuarioContextValue = {
  nombreUsuario: string | null;
  setNombreUsuario: (nombre: string) => void;
  clearNombre: () => void;

  iduUsuario: number | null;
  setIduUsuario: (idu: number) => void;
  clearIdu: () => void;

  listaEmpleadosCapturados: IEmpleadoCapturado[];
  setEmpleadosCap: (
    empleado:
      | IEmpleadoCapturado
      | ((prev: IEmpleadoCapturado[]) => IEmpleadoCapturado[])
  ) => void;
  clearEmpleados: () => void;
};

// Crea el contexto
const userContext = createContext<UsuarioContextValue | undefined>(undefined);

export const UsuarioProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [nombreUsuario, setNomUsuarioState] = useState<string | null>(null);
  const [iduUsuario, setIduUsuarioState] = useState<number | null>(null);
  const [listaEmpleadosCapturados, setListaEmpleadosCapturados] = useState<
    IEmpleadoCapturado[]
  >([]);

  // Métodos para nombre usuario
  const setNombreUsuario = (nombre: string) => setNomUsuarioState(nombre);
  const clearNombre = () => setNomUsuarioState(null);

  // Métodos para ID usuario
  const setIduUsuario = (idu: number) => setIduUsuarioState(idu);
  const clearIdu = () => setIduUsuarioState(null);

  // Métodos para lista de empleados
  const setEmpleadosCap = (
    empleado:
      | IEmpleadoCapturado
      | ((prev: IEmpleadoCapturado[]) => IEmpleadoCapturado[])
  ) => {
    if (typeof empleado === "function") {
      setListaEmpleadosCapturados((prev) => empleado(prev));
    } else {
      setListaEmpleadosCapturados((prev) => [...prev, empleado]);
    }
  };

  const clearEmpleados = () => setListaEmpleadosCapturados([]);

  // Memoiza el valor del contexto
  const value = useMemo(
    () => ({
      nombreUsuario,
      setNombreUsuario,
      clearNombre,
      iduUsuario,
      setIduUsuario,
      clearIdu,
      listaEmpleadosCapturados,
      setEmpleadosCap,
      clearEmpleados
    }),
    [nombreUsuario, iduUsuario, listaEmpleadosCapturados]
  );

  return <userContext.Provider value={value}>{children}</userContext.Provider>;
};

// Hook personalizado
export const useUser = () => {
  const ctx = useContext(userContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <UsuarioProvider>");
  return ctx;
};
