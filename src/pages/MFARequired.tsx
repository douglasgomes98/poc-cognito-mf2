import { useRef, useCallback, FormEvent } from 'react';
import { useAuthenticationContext } from '../contexts/AuthenticationContext';

export function MFARequired() {
  const inputCodeRef = useRef<HTMLInputElement>(null);

  const { handleVerifySoftwareTokenMfa } = useAuthenticationContext();

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const code = inputCodeRef.current?.value || '';

      await handleVerifySoftwareTokenMfa(code);
    },
    [handleVerifySoftwareTokenMfa],
  );

  return (
    <div>
      <h1>MFARequired</h1>

      <form onSubmit={handleSubmit}>
        <input type="code" name="code" ref={inputCodeRef} />
        <br />
        <button type="submit">send code</button>
      </form>
    </div>
  );
}
