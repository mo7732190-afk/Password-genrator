import { usePasswordStore } from "../store";

const GeneratedPassword = () => {
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
        generatePassword,
    } = usePasswordStore();

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-10">
      <div aria-hidden="true" className="absolute -left-24 top-12 size-72 rounded-full bg-sky-300/30 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-20 bottom-0 size-80 rounded-full bg-indigo-300/30 blur-3xl" />

      <div className="relative w-full max-w-xl rounded-3xl border border-white/90 bg-white/85 p-6 shadow-2xl shadow-indigo-950/10 backdrop-blur-xl sm:p-9">
        <div className="mb-7">
          <span className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold tracking-wide text-blue-700">
            SECURE PASSWORD TOOL
          </span>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Password Generator
        </h1>
          <p className="text-sm leading-6 text-slate-500">
          Create a strong password tailored to your needs.
        </p>
        </div>
        <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="password-length" className="mb-2 block text-sm font-semibold text-slate-700">
            Password Length
          </label>
          <input
            id="password-length"
            type="number"
            min={1}
            max={128}
            value={length}
            onChange={(event) => setLength(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-inner outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70">
          <input className="size-4 accent-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" type="checkbox" checked={includeNumbers} onChange={toggleNumbers} />
          Include Numbers
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70">
          <input className="size-4 accent-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" type="checkbox" checked={includeSymbols} onChange={toggleSymbols} />
          Include Symbols
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70">
          <input className="size-4 accent-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" type="checkbox" checked={includeUppercase} onChange={toggleUppercase} />
          Include Uppercase Letters
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/70">
          <input className="size-4 accent-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" type="checkbox" checked={includeLowercase} onChange={toggleLowercase} />
          Include Lowercase Letters
        </label>

        <button
          type="button"
          onClick={generatePassword}
          className="mt-1 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/25 transition duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 active:translate-y-0"
        >
          Generate Password
        </button>

        {generatedPassword && (
          <div className="mt-2">
            <label htmlFor="generated-password" className="mb-2 block text-sm font-semibold text-slate-700">
              Generated Password
            </label>
            <input
              id="generated-password"
              type="text"
              value={generatedPassword}
              readOnly
              className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-mono text-sm text-emerald-950 shadow-inner outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        )}
      </div>
      </div>
    </main>
  );
}

export default GeneratedPassword
