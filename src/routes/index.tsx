import { useAuthenticationContext } from '../contexts/AuthenticationContext';
import { SessionStep } from '../libs';
import { Dashboard } from '../pages/Dashboard';
import { MFARequired } from '../pages/MFARequired';
import { MFASetup } from '../pages/MFASetup';
import { NewPasswordRequired } from '../pages/NewPasswordRequired';
import { Sign } from '../pages/Sign';

export function AppRoutes() {
  const { sessionStep } = useAuthenticationContext();

  switch (sessionStep) {
    case SessionStep.LOGGED:
      return <Dashboard />;
    case SessionStep.LOGIN:
      return <Sign />;
    case SessionStep.NEW_PASSWORD_REQUIRED:
      return <NewPasswordRequired />;
    case SessionStep.MFA_SETUP:
      return <MFASetup />;
    case SessionStep.MFA_REQUIRED:
      return <MFARequired />;
    default:
      return null;
  }
}
