import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface LockScreenProps {
  pinHash: string;
  onUnlock: (enteredPin: string) => Promise<boolean>;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onUnlock(pin);
    if (!success) {
      setErrorMsg('Incorrect PIN');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg)] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 w-full max-w-xs text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-[var(--accs)] text-[var(--acc)] flex items-center justify-center shadow-lg">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-[var(--ink)]">JivanLekh is Locked</h3>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => {
            setErrorMsg('');
            setPin(e.target.value);
          }}
          placeholder="Enter PIN"
          className="w-full text-center text-xl font-mono tracking-widest bg-[var(--surf)] border border-[var(--line)] rounded-xl p-3 outline-none focus:border-[var(--acc)] text-[var(--ink)]"
        />

        {errorMsg && <p className="text-xs font-semibold text-red-500">{errorMsg}</p>}

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-[var(--acc)] text-white text-sm font-bold shadow-md hover:opacity-95"
        >
          Unlock App
        </button>
      </form>
    </div>
  );
};
