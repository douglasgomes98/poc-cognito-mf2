import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { Cognito, SessionStep } from '../libs';

interface LoginParams {
  email: string;
  password: string;
}

interface AuthenticationProviderProps {
  children: ReactNode;
}

interface AuthenticationContextProps {
  handleNewPasswordRequired: (newPassword: string) => Promise<void>;
  handleNewPasswordRequiredIsLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  loginIsLoading: boolean;
  logout: () => Promise<void>;
  sessionStep: SessionStep;
}

const AuthenticationContext = createContext({} as AuthenticationContextProps);

export function AuthenticationProvider({
  children,
}: AuthenticationProviderProps) {
  const sessionStep = Cognito.getCurrentSessionStep();
  const [loginIsLoading, setLoginIsLoading] = useState(false);
  const [
    handleNewPasswordRequiredIsLoading,
    setHandleNewPasswordRequiredIsLoading,
  ] = useState(false);

  const login = useCallback(async ({ email, password }: LoginParams) => {
    try {
      setLoginIsLoading(true);
      await Cognito.signIn(email, password);
    } catch (error) {
      console.log(error);
    } finally {
      setLoginIsLoading(false);
    }
  }, []);

  const handleNewPasswordRequired = useCallback(async (newPassword: string) => {
    try {
      setHandleNewPasswordRequiredIsLoading(true);
      await Cognito.handleNewPasswordRequired(newPassword);
    } catch (error) {
      console.log(error);
    } finally {
      setHandleNewPasswordRequiredIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    Cognito.signOut();
  }, []);

  const value = useMemo(
    () => ({
      handleNewPasswordRequired,
      handleNewPasswordRequiredIsLoading,
      login,
      loginIsLoading,
      logout,
      sessionStep,
    }),
    [
      handleNewPasswordRequired,
      handleNewPasswordRequiredIsLoading,
      login,
      loginIsLoading,
      logout,
      sessionStep,
    ],
  );

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
      'useAuthenticationContext outside of AuthenticationProvider',
    );
  }

  return context;
}
