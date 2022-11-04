import { FormEvent, useCallback, useRef } from 'react';
import { useAuthenticationContext } from '../contexts/AuthenticationContext';

export function Sign() {
  const inputEmailRef = useRef<HTMLInputElement>(null);
  const inputPasswordRef = useRef<HTMLInputElement>(null);

  const { login } = useAuthenticationContext();

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const email = inputEmailRef.current?.value || '';
      const password = inputPasswordRef.current?.value || '';

      await login({ email, password });
    },
    [login],
  );

  return (
    <div>
      <h1>Sign</h1>

      <form onSubmit={handleSubmit}>
        <input type="email" name="email" ref={inputEmailRef} />
        <br />
        <input type="password" name="password" ref={inputPasswordRef} />
        <br />
        <button type="submit">login</button>
      </form>
    </div>
  );
}
