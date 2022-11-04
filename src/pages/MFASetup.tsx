import { FormEvent, useCallback, useRef } from 'react';
import { useAuthenticationContext } from '../contexts/AuthenticationContext';

export function MFASetup() {
  const inputCodeRef = useRef<HTMLInputElement>(null);
  const inputDeviceRef = useRef<HTMLInputElement>(null);

  const { handleVerifySoftwareTokenMfaSetup, mfaSecretCode } =
    useAuthenticationContext();

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const code = inputCodeRef.current?.value || '';
      const device = inputDeviceRef.current?.value || '';

      await handleVerifySoftwareTokenMfaSetup(code, device);
    },
    [handleVerifySoftwareTokenMfaSetup],
  );

  console.log({ mfaSecretCode });

  return (
    <div>
      <h1>MFASetup</h1>

      <form onSubmit={handleSubmit}>
        <input type="code" name="code" ref={inputCodeRef} />
        <br />
        <input type="device" name="device" ref={inputDeviceRef} />
        <br />
        <input type="code" name="code" ref={inputCodeRef} />
        <br />
        <button type="submit">set totp code</button>
      </form>
    </div>
  );
}
