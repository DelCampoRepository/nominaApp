import React , {createContext, useContext, useMemo, useState    } from "react";




type EmployeeContextValue = {
    employeeCode: string | null;
    setEmployeeCode: (code: string) => void;
    clearEmployeeCode: () => void;

  
  codLote: string | null; // 👈 nueva variable
  setCodLote: (name: string) => void;
  clearCodLote: () => void;
  
  nombreEmpleadoState: string | null;
  setNombreEmpleado:(name:string) => void;
  clearNombre:() => void;
};



const EmployeeContext = createContext<EmployeeContextValue | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employeeCode, setEmployeeCodeState] = useState<string | null>(null);
  const [codLote, setCodLoteState] = useState<string | null>(null);
  const [nombreEmpleadoState,SetNombreEmpleadoState] = useState<string | null>(null);

  //editamos el codigo de empleado en la seleccion de la lista 
  const setEmployeeCode = (code: string) => setEmployeeCodeState(code);
  const clearEmployeeCode = () => setEmployeeCodeState(null);

  //editamos nombre de empleado en la seleccion de la lista
  const setNombreEmpleado =(nombre: string) =>SetNombreEmpleadoState(nombre);
 const clearNombre = () => SetNombreEmpleadoState(null);

//editamos el codDeEmpleado
  const setCodLote = (name: string) => setCodLoteState(name); // 👈 setters para name
  const clearCodLote = () => setCodLoteState(null);


const value = useMemo(
    () => ({
      employeeCode,
      setEmployeeCode,
      clearEmployeeCode,
      
      codLote,
      setCodLote,
      clearCodLote,
      
      nombreEmpleadoState,
      setNombreEmpleado,
      clearNombre
    }),
    [employeeCode, codLote,nombreEmpleadoState] // 👈 agregas ambos como dependencias
  );

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};

export const useEmployee = () => {
  const ctx2 = useContext(EmployeeContext);
  if (!ctx2) throw new Error('useEmployee debe usarse dentro de <EmployeeProvider>');
  return ctx2;
};