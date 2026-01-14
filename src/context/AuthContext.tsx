import type React from "react";
import { createContext, type ReactNode, useContext, useState } from "react";

interface User {
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pin: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, pin: string) => {
    // Simulate API call with mock data
    // In production, this would call your backend
    const mockUsers = [
      { email: "resident1@apartment.com", pin: "1234", id: "1" },
      { email: "resident2@apartment.com", pin: "5678", id: "2" },
      { email: "resident3@apartment.com", pin: "9012", id: "3" },
    ];

    const foundUser = mockUsers.find((u) => u.email === email && u.pin === pin);

    if (foundUser) {
      setUser({ email: foundUser.email, id: foundUser.id });
    } else {
      throw new Error("Invalid email or PIN");
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
