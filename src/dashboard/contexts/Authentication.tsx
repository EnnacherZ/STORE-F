import React, {
  useState,
  useEffect,
  useContext,
  createContext,
} from "react";
import Loading from "../../components/loading";
import apiInstance, { USER_FIRSTNAME, USER_IMAGE, USER_LASTNAME, USER_ROLE, USER_USERNAME } from "../api";
import Login from "../LogIn";

type AuthContextType = {
  isAuthorized: boolean | null;
  isLoading: boolean;
  signIn: (e: React.FormEvent, username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthorized: null,
  isLoading: false,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // ✅ Check if user is authenticated by calling a protected endpoint
  const checkAuth = async () => {
    try {
      await apiInstance.get("db/check-auth/"); // Replace with any protected endpoint
      setIsAuthorized(true);
    } catch {
      // If token expired, try to refresh
      await tryRefreshToken();
    }
  };

  // ✅ Try to refresh token using the cookie
  const tryRefreshToken = async () => {
    try {
      await apiInstance.post("db/refreshcookie");
      setIsAuthorized(true);
    } catch {
      setIsAuthorized(false);
    }
  };

  // ✅ Login: sets cookies automatically via Django
  const signIn = async (
    e: React.FormEvent,
    username: string,
    password: string
  ) => {
    setIsLoading(true);
    e.preventDefault();
    try {
        const res = await apiInstance.post("db/token", { username, password });
        localStorage.setItem(USER_ROLE, res.data.user.role);
        localStorage.setItem(USER_USERNAME, res.data.user.username);
        localStorage.setItem(USER_IMAGE, res.data.user.image);
        localStorage.setItem(USER_FIRSTNAME, res.data.user.first_name);
        localStorage.setItem(USER_LASTNAME, res.data.user.last_name);
        
      setIsAuthorized(true);
    } catch(error) {
      console.log(error)
      alert("FORBIDDEN !!");
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Logout: clear cookies by calling backend
  const signOut = async () => {
    try {
        await apiInstance.post("db/logout");
        setIsAuthorized(false);
        localStorage.setItem(USER_ROLE, "");
        localStorage.setItem(USER_USERNAME, "");
        localStorage.setItem(USER_IMAGE, "");
        localStorage.setItem(USER_FIRSTNAME, "");
        localStorage.setItem(USER_LASTNAME, "");

    } catch (error) {
      console.warn("Logout error", error);
    } finally {
      setIsAuthorized(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthorized, isLoading, signIn, signOut }}>
      {isAuthorized === null ? (
        <Loading message="Authentication..." />
      ) : isAuthorized ? (
        children
      ) : (
        <Login />
      )}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthContext };
