import { AuthenticationProvider } from "./contexts/AuthenticationContext";
import { Sign } from "./pages/Sign";

function App() {
  return (
    <AuthenticationProvider>
      <Sign />
    </AuthenticationProvider>
  );
}

export default App;
