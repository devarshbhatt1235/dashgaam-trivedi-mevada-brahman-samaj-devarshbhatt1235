import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, UserInfo } from "@workspace/api-client-react";

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("samaj_token"));
  
  const { data: user, isLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (error) {
      // If /me fails, clear invalid token
      setToken(null);
      localStorage.removeItem("samaj_token");
    }
  }, [error]);

  const login = (newToken: string) => {
    localStorage.setItem("samaj_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("samaj_token");
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ 
      user: user || null, 
      token, 
      isLoading: !!token && isLoading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
