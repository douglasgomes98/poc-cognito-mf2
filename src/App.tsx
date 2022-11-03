import { AuthenticationProvider } from "./contexts/AuthenticationContext";

function App() {
  return (
    <AuthenticationProvider>
      <h1>Hello World</h1>
    </AuthenticationProvider>
  );
}

export default App;
