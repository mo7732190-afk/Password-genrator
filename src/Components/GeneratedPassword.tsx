import { useState } from "react";
import { usePasswordStore } from "../store";

const GeneratedPassword = () => {
  const [copyMessage, setCopyMessage] = useState("");
  const {
    length,
    setLength,
    includeNumbers,
    toggleNumbers,
    includeSymbols,
    toggleSymbols,
    includeUppercase,
    toggleUppercase,
    includeLowercase,
    toggleLowercase,
    generatedPassword,
    passwordStrength,
    generatePassword,
  } = usePasswordStore();

  const copyPassword = async () => {
    if (!generatedPassword) return;

    await navigator.clipboard.writeText(generatedPassword);
    setCopyMessage("Copied!");
    window.setTimeout(() => setCopyMessage(""), 2000);
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-xl rounded-[28px] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.12)] sm:p-5">
        <button
          type="button"
          onClick={generatePassword}
          className="mb-6 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-xl font-bold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-105"
        >
          Generate Password
        </button>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-semibold text-slate-800 sm:text-[18px]">
              Generated Password
            </h2>
            {passwordStrength && generatedPassword && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                {passwordStrength}
              </span>
            )}
          </div>

          {generatedPassword && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <input
                id="generated-password"
                type="text"
                value={generatedPassword}
                readOnly
                className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 font-mono text-base text-slate-800 outline-none"
              />
              <button
                type="button"
                onClick={copyPassword}
                className="shrink-0 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                {copyMessage || "Copy Password"}
              </button>
            </div>
          )}
        </div>

        {passwordStrength && !generatedPassword && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {passwordStrength}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <div>
            <label htmlFor="password-length" className="mb-2 block text-sm font-semibold text-slate-700">
              Password Length
            </label>
            <input
              id="password-length"
              type="number"
              min={4}
              max={128}
              value={length}
              onChange={(event) => setLength(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-inner outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-slate-50">
            <input className="size-4 accent-blue-600" type="checkbox" checked={includeNumbers} onChange={toggleNumbers} />
            Include Numbers
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-slate-50">
            <input className="size-4 accent-blue-600" type="checkbox" checked={includeSymbols} onChange={toggleSymbols} />
            Include Symbols
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-slate-50">
            <input className="size-4 accent-blue-600" type="checkbox" checked={includeUppercase} onChange={toggleUppercase} />
            Include Uppercase Letters
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-slate-50">
            <input className="size-4 accent-blue-600" type="checkbox" checked={includeLowercase} onChange={toggleLowercase} />
            Include Lowercase Letters
          </label>
        </div>
      </div>
    </main>
  );
};

export default GeneratedPassword;
