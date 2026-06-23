// 📁 src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionRequiredAuthError, InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "../auth/msalConfig";

const AuthContext = createContext();

const BASE_URL = "http://localhost:5000";

export function AuthProvider({ children }) {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const [user,        setUser]        = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [accessToken, setAccessToken] = useState(null);
 

  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const login = async () => {
    if (inProgress !== InteractionStatus.None) return;
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Microsoft нэвтрэхэд алдаа:", error);
    }
  };

  const logout = async () => {
    if (inProgress !== InteractionStatus.None) return;
    setIsLoading(true);
    await instance.logoutRedirect();
  };

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) return;

    const acquireAndSync = async () => {
      if (!isAuthenticated || accounts.length === 0) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        let tokenResponse;
        try {
          tokenResponse = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
        } catch (err) {
          if (err instanceof InteractionRequiredAuthError) {
            await instance.acquireTokenRedirect(loginRequest);
            return;
          }
          throw err;
        }

        const idToken = tokenResponse.idToken;
        setAccessToken(idToken);

        // ✅ ЗАСВАР: /auth/azure-callback → /api/auth/azure-callback
        const res = await fetch(`${BASE_URL}/api/auth/azure-callback`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ idToken }),
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          const errText = await res.text();
          console.error("Backend verify амжилтгүй:", res.status, errText);
          setUser(null);
        }
      } catch (error) {
        console.error("Token авахад алдаа:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    acquireAndSync();
  }, [isAuthenticated, accounts, instance, inProgress]);

  return (
    <AuthContext.Provider value={{
      user, isLoading, login, logout,
      accessToken, API_URL: `${BASE_URL}/api`, BASE_URL,
      dark, setDark,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
