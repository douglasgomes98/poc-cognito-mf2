import { FormEvent, useCallback, useRef } from 'react';
import { useAuthenticationContext } from '../contexts/AuthenticationContext';

export function NewPasswordRequired() {
  const inputPasswordRef = useRef<HTMLInputElement>(null);

  const { handleNewPasswordRequired } = useAuthenticationContext();

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const password = inputPasswordRef.current?.value || '';

      await handleNewPasswordRequired(password);
    },
    [handleNewPasswordRequired],
  );

  return (
    <div>
      <h1>NewPasswordRequired</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          name="password"
          placeholder="password"
          ref={inputPasswordRef}
        />
        <br />
        <button type="submit">change password</button>
      </form>
    </div>
  );
}
