import type React from "react";
import { createContext, type ReactNode, useContext, useState } from "react";

interface User {
  forename: string;
  id: string | number;
  token?: string;
  apartmentNumber: string;
}

interface AuthContextType {
  user: User | null;
  login: (apartmentNumber: string, pin: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (apartmentNumber: string, pin: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apartmentNumber, pin }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed. Please try again.");
      }

      const data: { userId: number; forename: string; token: string; apartmentNumber: string } = await response.json();

      setUser({
        forename: data.forename,
        id: data.userId,
        token: data.token,
        apartmentNumber: data.apartmentNumber,
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
