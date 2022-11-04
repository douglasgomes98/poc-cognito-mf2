import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { Cognito } from "../libs";

interface LoginParams {
  email: string;
  password: string;
}

interface AuthenticationProviderProps {
  children: ReactNode;
}

interface AuthenticationContextProps {
  login: (params: LoginParams) => Promise<void>;
  loginIsLoading: boolean;
  logout: () => Promise<void>;
}

const AuthenticationContext = createContext({} as AuthenticationContextProps);

export function AuthenticationProvider({
  children,
}: AuthenticationProviderProps) {
  const [loginIsLoading, setLoginIsLoading] = useState(false);

  const login = useCallback(async ({ email, password }: LoginParams) => {
    setLoginIsLoading(true);

    try {
      const response = await Cognito.signIn(email, password);

      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoginIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    Cognito.signOut();
  }, []);

  const value = useMemo(() => {
    return {
      login,
      loginIsLoading,
      logout,
    };
  }, [login, loginIsLoading, logout]);

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuthenticationContext() {
  const context = useContext(AuthenticationContext);

  if (Object.keys(context).length === 0) {
    throw new Error(
      "useAuthenticationContext outside of AuthenticationProvider"
    );
  }

  return context;
}
