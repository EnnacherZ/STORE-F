import React, {
  createContext, useCallback, useContext,
  useEffect, useRef, useState,
} from "react";
import { connecter } from "../server/connecter";

export interface ClientProfile {
  email:          string;
  first_name:     string;
  last_name:      string;
  phone?:         string ;
  address?:       string ;
  city?:          string ;
  country?:       string ;
  image?:         string ;
  loyalty_points: number;
}

export interface SignUpPayload {
  email:        string;
  password:     string;
  first_name:   string;
  last_name:    string;
  phone:       string;
  address:     string;
}

interface AuthState {
  client:          ClientProfile | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signIn:  (email: string, password: string) => Promise<void>;
  signUp:  (data: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const ClientAuthContext = createContext<AuthContextValue | null>(null);

export function useClientAuth(): AuthContextValue {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) throw new Error("useClientAuth must be used inside <ClientAuthProvider>");
  return ctx;
}

export const ClientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    client: null, isLoading: true, isAuthenticated: false,
  });
  const didFetch = useRef(false);

  const fetchMe = useCallback(async (isRetry = false): Promise<void> => {
    try {
      const res = await connecter.get<ClientProfile>("api/client/me/");
      setState({ client: res.data, isLoading: false, isAuthenticated: true });
    } catch (err: any) {
      if (err?.response?.status === 401 && !isRetry) {
        try {
          await connecter.post("api/client/refresh/");
          return fetchMe(true);
        } catch { /* refresh expired */ }
      }
      setState({ client: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    fetchMe();
  }, [fetchMe]);

  const signIn = useCallback(async (email: string, password: string) => {
    await connecter.post("api/client/signin/", { email, mot_de_passe: password });
    await fetchMe();
  }, [fetchMe]);

  const signUp = useCallback(async (data: SignUpPayload) => {
    await connecter.post("api/client/signup/", data);
  }, []);

  const signOut = useCallback(async () => {
    try { await connecter.post("api/client/signout/"); }
    finally { setState({ client: null, isLoading: false, isAuthenticated: false }); }
  }, []);

  return (
    <ClientAuthContext.Provider value={{ ...state, signIn, signUp, signOut, refresh: fetchMe }}>
      {children}
    </ClientAuthContext.Provider>
  );
};