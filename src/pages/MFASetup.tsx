import { FormEvent, useCallback, useRef } from 'react';
import QRCode from 'react-qr-code';
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

      {mfaSecretCode && (
        <>
          <div>
            <QRCode size={256} value={mfaSecretCode} />
          </div>
          <br />
        </>
      )}

      <form onSubmit={handleSubmit}>
        <input type="code" name="code" placeholder="code" ref={inputCodeRef} />
        <br />
        <input
          type="device"
          name="device"
          placeholder="device"
          ref={inputDeviceRef}
        />
        <br />
        <button type="submit">set totp code</button>
      </form>
    </div>
  );
}
