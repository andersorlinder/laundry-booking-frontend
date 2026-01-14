import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, pin);
      navigate("/booking");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 font-sans">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-3">Tvättbokningssystem</h1>
        <p className="text-center text-gray-600 text-sm mb-8">Hyreshusvälvningar</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block text-gray-800 font-medium text-sm mb-2">
              E-postadress
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din.epost@hyreshus.se"
              required
              disabled={isLoading}
              className="w-full px-3 py-3 border-2 border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="pin" className="block text-gray-800 font-medium text-sm mb-2">
              PIN-kod
            </label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Ange din 4-siffriga PIN-kod"
              maxLength={4}
              required
              disabled={isLoading}
              className="w-full px-3 py-3 border-2 border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 px-3 py-3 rounded-md mb-5 text-sm border-l-4 border-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md text-base font-semibold cursor-pointer transition-opacity disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90"
          >
            {isLoading ? "Loggar in..." : "Logga in"}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-gray-300 bg-gray-50 p-4 rounded-md text-xs">
          <p className="text-gray-700 font-semibold mb-2">Demoinloggningar:</p>
          <ul className="pl-5 text-gray-700 space-y-1">
            <li className="font-mono">Email: resident1@apartment.com, PIN: 1234</li>
            <li className="font-mono">Email: resident2@apartment.com, PIN: 5678</li>
            <li className="font-mono">Email: resident3@apartment.com, PIN: 9012</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
