import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import * as cognito from "./cognito";

interface LoginParams {
  email: string;
  password: string;
}

interface AuthenticationProviderProps {
  children: ReactNode;
}

interface AuthenticationContextProps {
  // isAuthenticated: boolean;
  login: (params: LoginParams) => Promise<void>;
  loginError: string | null;
  loginIsLoading: boolean;
  logout: () => Promise<void>;
  // onLoginSuccess?: () => void;
  // onLoginFailure?: (error: unknown) => void;
}

const AuthenticationContext = createContext({} as AuthenticationContextProps);

export function AuthenticationProvider({
  children,
}: AuthenticationProviderProps) {
  const [loginIsLoading, setLoginIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = useCallback(async ({ email, password }: LoginParams) => {
    setLoginIsLoading(true);

    try {
      const response = await cognito.signInWithEmail(
        "douglasgomes@zenitcreative.com",
        "9tq4cr@#$D"
      );
      // const user = await Auth.signIn(email, password);

      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoginIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await cognito.signOut();
  }, []);

  const value = useMemo(() => {
    return {
      login,
      loginError,
      loginIsLoading,
      logout,
    };
  }, [login, loginError, loginIsLoading, logout]);

  // useEffect(() => {
  //   (async () => {
  //     const response1 = await cognito.getSession();
  //     const response2 = await cognito.getCurrentUser();
  //     const response3 = await cognito.getAttributes();

  //     console.log({ response1, response2, response3 });
  //   })();
  // }, []);

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
