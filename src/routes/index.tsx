import { useAuthenticationContext } from '../contexts/AuthenticationContext';
import { SessionStep } from '../libs';
import { NewPasswordRequired } from '../pages/NewPasswordRequired';
import { Sign } from '../pages/Sign';

export function AppRoutes() {
  const { sessionStep } = useAuthenticationContext();
  console.log({ sessionStep });

  switch (sessionStep) {
    case SessionStep.LOGIN:
      return <Sign />;
    case SessionStep.NEW_PASSWORD_REQUIRED:
      return <NewPasswordRequired />;
    default:
      return null;
  }
}
