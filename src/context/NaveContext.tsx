import React, { createContext, useContext, useMemo, useState } from "react";

type NaveContextValue = {
  codNave: string | null;
  setCodNave: (code: string) => void;
  clearCodNave: () => void;
};

const NaveContext = createContext<NaveContextValue | undefined>(undefined);

export const NaveProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [codNave, setCodNaveState] = useState<string | null>(null);

  const setCodNave = (code: string) => setCodNaveState(code);
  const clearCodNave = () => setCodNaveState(null);

  const value = useMemo(
    () => ({ codNave, setCodNave, clearCodNave }),
    [codNave]
  );

  return <NaveContext.Provider value={value}>{children}</NaveContext.Provider>;
};

export const useNave = () => {
  const ctx = useContext(NaveContext);
  if (!ctx) throw new Error("useNave debe usarse dentro de <NaveProvider>");
  return ctx;
};
