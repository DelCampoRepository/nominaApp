import React, {
  Children,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

//definicmon del tipo de contexto
interface AuthContexType {
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

//creacion del contexto
export const AuthContext = createContext<AuthContexType>({
  token: null,
  login: async (token: string) => {},
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  //cargar token al abrir la app
  useEffect(() => {
    const loadToknen = async () => {
      const savedToken = await AsyncStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
      }
    };
    loadToknen();
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    await AsyncStorage.setItem("token", newToken);
    console.log("Se ha guardado  el token", token);
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem("token");
    console.log("Se ha borrado  el token");
  };

  return (
    <AuthContext.Provider value={{ token: token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
