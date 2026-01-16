import type React from "react";
import { createContext, type ReactNode, useContext, useState } from "react";

interface User {
  email: string;
  id: string | number;
  token?: string;
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
    try {
      const response = await fetch("http://localhost:5272/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, pin }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed. Please try again.");
      }

      const data: { userId: number; email: string; token: string } = await response.json();

      setUser({
        email: data.email,
        id: data.userId,
        token: data.token,
      });

      // Store token in localStorage for authenticated requests
      localStorage.setItem("authToken", data.token);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please check your connection.");
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
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
