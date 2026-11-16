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
    <main className="flex min-h-screen w-full items-center justify-center bg-[#edf1f4] px-4 py-8">
      <div className="w-full max-w-[760px] rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.10)] sm:p-6">
        <button
          type="button"
          onClick={generatePassword}
          className="mb-6 flex w-full items-center justify-center rounded-[18px] bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-2xl font-bold text-white shadow-[0_10px_20px_rgba(37,99,235,0.25)] transition hover:brightness-105"
        >
          Generate Password
        </button>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[18px] font-semibold text-slate-800 sm:text-[20px]">
              Generated Password
            </h2>
            {passwordStrength && generatedPassword && (
              <span className="rounded-full bg-[#bdeed8] px-3 py-1 text-[12px] font-semibold text-[#1f7b4c]">
                {passwordStrength}
              </span>
            )}
          </div>

          {generatedPassword && (
            <div className="flex items-center gap-3 rounded-[16px] border border-[#a9e0c5] bg-[#cfeee0] p-3 shadow-inner shadow-[#bfe8d3]">
              <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[18px] font-medium text-slate-800">
                {generatedPassword}
              </div>
              <button
                type="button"
                onClick={copyPassword}
                className="shrink-0 rounded-[14px] bg-[#1ca66c] px-5 py-3 text-base font-bold text-white shadow-[0_6px_12px_rgba(28,166,108,0.25)] transition hover:bg-[#169b5f]"
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
            <label htmlFor="password-length" className="mb-2 block text-[15px] font-semibold text-slate-700">
              Password Length
            </label>
            <input
              id="password-length"
              type="number"
              min={4}
              max={128}
              value={length}
              onChange={(event) => setLength(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[16px] text-slate-900 shadow-inner outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-[15px] font-medium text-slate-700 transition hover:border-blue-200 hover:bg-slate-50">
            <input className="size-4 accent-blue-600" type="checkbox" checked={includeNumbers} onChange={toggleNumbers} />
            Include Numbers
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-[15px] font-medium text-slate-700 transition hover:border-blue-200 hover:bg-slate-50">
            <input className="size-4 accent-blue-600" type="checkbox" checked={includeSymbols} onChange={toggleSymbols} />
            Include Symbols
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-[15px] font-medium text-slate-700 transition hover:border-blue-200 hover:bg-slate-50">
            <input className="size-4 accent-blue-600" type="checkbox" checked={includeUppercase} onChange={toggleUppercase} />
            Include Uppercase Letters
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-[15px] font-medium text-slate-700 transition hover:border-blue-200 hover:bg-slate-50">
            <input className="size-4 accent-blue-600" type="checkbox" checked={includeLowercase} onChange={toggleLowercase} />
            Include Lowercase Letters
          </label>
        </div>
      </div>
    </main>
  );
};

export default GeneratedPassword;
