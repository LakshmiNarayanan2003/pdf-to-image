import { useEffect, useRef, useState } from 'react';
import type { PasswordRequest } from '../lib/types';
export function PasswordDialog({ request }: { request: PasswordRequest }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState('');
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="password-dialog"
      aria-labelledby="password-title"
      onCancel={(event) => {
        event.preventDefault();
        request.cancel();
      }}
    >
      <h2 id="password-title">Unlock your PDF</h2>
      <p className="break-name">{request.name}</p>
      <p>
        {request.incorrect
          ? 'That password did not work. Try again.'
          : 'The password stays in memory and is never sent anywhere.'}
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          request.submit(password);
          setPassword('');
        }}
      >
        <label htmlFor="pdf-password">PDF password</label>
        <input
          id="pdf-password"
          type="password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="off"
        />
        <div className="dialog-actions">
          <button
            type="button"
            className="button secondary"
            onClick={request.cancel}
          >
            Cancel opening
          </button>
          <button className="button primary" type="submit">
            Unlock PDF
          </button>
        </div>
      </form>
    </dialog>
  );
}
