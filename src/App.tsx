import { AuthenticationProvider } from './contexts/AuthenticationContext';
import { AppRoutes } from './routes';

function App() {
  return (
    <AuthenticationProvider>
      <AppRoutes />
    </AuthenticationProvider>
  );
}

export default App;
