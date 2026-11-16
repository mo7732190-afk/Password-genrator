import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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

  const getStrengthStyle = (strength: string) => {
    const lower = strength?.toLowerCase() || "";
    if (lower.includes("strong")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (lower.includes("medium")) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center  px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-135 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8"
      >
        {/* Header & Strength Badge */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold tracking-tight text-white"
          >
            Password Generator
          </motion.h2>
          <AnimatePresence>
            {passwordStrength && generatedPassword && (
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase shadow-sm ${getStrengthStyle(
                  passwordStrength
                )}`}
              >
                {passwordStrength}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Generated Password Output Box */}
        <motion.div 
          key={generatedPassword}
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-inner"
        >
          <div className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-lg font-semibold text-teal-400">
            <AnimatePresence mode="wait">
              {generatedPassword ? (
                <motion.span
                  key={generatedPassword}
                  initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.2 }}
                  className="inline-block"
                >
                  {generatedPassword}
                </motion.span>
              ) : (
                <span className="font-sans text-sm font-normal text-slate-500">
                  Click generate to create password...
                </span>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={copyPassword}
            disabled={!generatedPassword}
            className="relative shrink-0 overflow-hidden rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copyMessage || "default"}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {copyMessage || "Copy"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Warning / Error Message */}
        <AnimatePresence>
          {passwordStrength && !generatedPassword && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-400"
            >
              {passwordStrength}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Controls Section */}
        <div className="space-y-4">
          {/* Length Input */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password-length"
                className="text-sm font-semibold text-slate-300"
              >
                Password Length
              </label>
              <motion.span 
                key={length}
                initial={{ scale: 1.3, color: "#2dd4bf" }}
                animate={{ scale: 1, color: "#2dd4bf" }}
                className="rounded-md bg-slate-950 px-2.5 py-0.5 font-mono text-sm font-bold text-teal-400 border border-slate-800"
              >
                {length}
              </motion.span>
            </div>
            <input
              id="password-length"
              type="number"
              min={4}
              max={128}
              value={length}
              onChange={(event) => setLength(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-base font-medium text-white outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>

          {/* Checkboxes Grid */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {[
              { label: "Uppercase (A-Z)", checked: includeUppercase, onChange: toggleUppercase },
              { label: "Lowercase (a-z)", checked: includeLowercase, onChange: toggleLowercase },
              { label: "Numbers (0-9)", checked: includeNumbers, onChange: toggleNumbers },
              { label: "Symbols (!@#$)", checked: includeSymbols, onChange: toggleSymbols },
            ].map((item, index) => (
              <motion.label
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-medium text-slate-300 transition hover:border-teal-600/40"
              >
                <input
                  className="size-4 rounded accent-teal-500"
                  type="checkbox"
                  checked={item.checked}
                  onChange={item.onChange}
                />
                {item.label}
              </motion.label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={generatePassword}
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-teal-600 px-5 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-teal-500"
        >
          Generate Password
        </motion.button>
      </motion.div>
    </div>
  );
};

export default GeneratedPassword;