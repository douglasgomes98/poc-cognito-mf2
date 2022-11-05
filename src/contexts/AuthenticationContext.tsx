import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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
  handleVerifySoftwareTokenMfa: (secretCode: string) => Promise<void>;
  handleVerifySoftwareTokenMfaSetup: (
    totpCode: string,
    friendlyDeviceName: string,
  ) => Promise<void>;
  login: (params: LoginParams) => Promise<void>;
  loginIsLoading: boolean;
  logoffIsLoading: boolean;
  logout: () => Promise<void>;
  mfaSecretCode: string | null;
  sessionStep: SessionStep;
  verifySoftwareTokenMfaIsLoading: boolean;
  verifySoftwareTokenMfaSetupIsLoading: boolean;
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
  const [
    verifySoftwareTokenMfaSetupIsLoading,
    setVerifySoftwareTokenMfaSetupIsLoading,
  ] = useState(false);
  const mfaSecretCode = Cognito.getMfaSecretCode();
  const [logoffIsLoading, setLogoffIsLoading] = useState(false);
  const [verifySoftwareTokenMfaIsLoading, setVerifySoftwareTokenMfaIsLoading] =
    useState(false);

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

  const handleVerifySoftwareTokenMfaSetup = useCallback(
    async (totpCode: string, friendlyDeviceName: string) => {
      try {
        setVerifySoftwareTokenMfaSetupIsLoading(true);
        await Cognito.handleVerifySoftwareTokenMfaSetup(
          totpCode,
          friendlyDeviceName,
        );
      } catch (error) {
        console.log(error);
      } finally {
        setVerifySoftwareTokenMfaSetupIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      setLogoffIsLoading(true);
      await Cognito.signOut();
    } catch (error) {
      console.log(error);
    } finally {
      setLogoffIsLoading(false);
    }
  }, []);

  const handleVerifySoftwareTokenMfa = useCallback(
    async (secretCode: string) => {
      try {
        setVerifySoftwareTokenMfaIsLoading(true);
        await Cognito.handleVerifySoftwareTokenMfa(secretCode);
      } catch (error) {
        console.log(error);
      } finally {
        setVerifySoftwareTokenMfaIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    (async () => {
      const session = await Cognito.getSession();
      const userAttributes = await Cognito.getUserAttributes();

      console.log({ session, userAttributes });
    })();
  }, []);

  const value = useMemo(
    () => ({
      handleNewPasswordRequired,
      handleNewPasswordRequiredIsLoading,
      handleVerifySoftwareTokenMfa,
      handleVerifySoftwareTokenMfaSetup,
      login,
      loginIsLoading,
      logoffIsLoading,
      logout,
      mfaSecretCode,
      sessionStep,
      verifySoftwareTokenMfaIsLoading,
      verifySoftwareTokenMfaSetupIsLoading,
    }),
    [
      handleNewPasswordRequired,
      handleNewPasswordRequiredIsLoading,
      handleVerifySoftwareTokenMfa,
      handleVerifySoftwareTokenMfaSetup,
      login,
      loginIsLoading,
      logoffIsLoading,
      logout,
      mfaSecretCode,
      sessionStep,
      verifySoftwareTokenMfaIsLoading,
      verifySoftwareTokenMfaSetupIsLoading,
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
