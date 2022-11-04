import { useAuthenticationContext } from '../contexts/AuthenticationContext';

export function Dashboard() {
  const { logout } = useAuthenticationContext();

  return (
    <div>
      <h1>Dashboard</h1>

      <button type="button" onClick={logout}>
        logoff
      </button>
    </div>
  );
}
