import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePasswordStore } from "../store";

const GeneratedPassword = () => {
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ========================================================
  // 1. useRef Hooks
  // ========================================================
  // Ref for password input field to select/highlight text on copy
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  // Ref for auto-scrolling history container to top on new password
  const historyContainerRef = useRef<HTMLDivElement | null>(null);

  // Refs for tracking copy notification timeouts to prevent memory leaks
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyCopyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    history = [],
    theme = "dark",
    toggleTheme,
    generatePassword,
    deleteHistoryItem,
    clearHistory,
  } = usePasswordStore();

  const isDark = theme === "dark";

  // Cleanup timeout refs on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (historyCopyTimeoutRef.current) clearTimeout(historyCopyTimeoutRef.current);
    };
  }, []);

  // ========================================================
  // 2. useMemo Hooks
  // ========================================================
  // Memoize styling for password strength badge with high contrast for both themes
  const strengthStyle = useMemo(() => {
    const lower = passwordStrength?.toLowerCase() || "";
    if (lower.includes("very strong")) {
      return isDark
        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        : "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold";
    }
    if (lower.includes("strong")) {
      return isDark
        ? "bg-teal-500/15 text-teal-400 border-teal-500/30"
        : "bg-teal-100 text-teal-900 border-teal-300 font-bold";
    }
    if (lower.includes("good") || lower.includes("medium")) {
      return isDark
        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
        : "bg-amber-100 text-amber-900 border-amber-300 font-bold";
    }
    return isDark
      ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
      : "bg-rose-100 text-rose-900 border-rose-300 font-bold";
  }, [passwordStrength, isDark]);

  // Memoize filtered history list based on search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const query = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.password.toLowerCase().includes(query) ||
        item.formattedDate.toLowerCase().includes(query) ||
        item.formattedTime.toLowerCase().includes(query) ||
        item.strength.toLowerCase().includes(query)
    );
  }, [history, searchQuery]);

  // Memoize history statistics (total passwords and strong passwords count)
  const historyStats = useMemo(() => {
    const total = history.length;
    const strongCount = history.filter((h) =>
      h.strength.toLowerCase().includes("strong")
    ).length;
    return { total, strongCount };
  }, [history]);

  // ========================================================
  // 3. useCallback Hooks
  // ========================================================
  // Memoize main copy password handler (uses passwordInputRef)
  const copyPassword = useCallback(async () => {
    if (!generatedPassword) return;

    // Use useRef to highlight and select text visually
    passwordInputRef.current?.select();
    passwordInputRef.current?.setSelectionRange(0, 99999);

    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopyMessage("Copied!");

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopyMessage("");
      }, 2000);
    } catch {
      setCopyMessage("Failed!");
    }
  }, [generatedPassword]);

  // Memoize copy handler for individual items in the history list
  const copyHistoryPassword = useCallback(async (id: string, password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedItemId(id);

      if (historyCopyTimeoutRef.current) {
        clearTimeout(historyCopyTimeoutRef.current);
      }

      historyCopyTimeoutRef.current = setTimeout(() => {
        setCopiedItemId(null);
      }, 2000);
    } catch {
      // ignore
    }
  }, []);

  // Memoize generate password handler (scrolls history container via useRef)
  const handleGeneratePassword = useCallback(() => {
    generatePassword();

    // Auto-scroll the history list box smoothly to the top
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [generatePassword]);

  // Memoize delete item handler
  const handleDeleteItem = useCallback(
    (id: string) => {
      deleteHistoryItem(id);
    },
    [deleteHistoryItem]
  );

  // Memoize clear all history handler
  const handleClearHistory = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all password history?")) {
      clearHistory();
    }
  }, [clearHistory]);

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 px-3 py-4 sm:px-6 sm:py-8 flex flex-col items-center justify-start sm:justify-center ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* Top Bar: Brand Pill on left, Theme Toggle on right (Fully mobile responsive) */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-4 sm:mb-6">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${
            isDark
              ? "bg-teal-500/10 border-teal-500/25 text-teal-400"
              : "bg-teal-100 border-teal-300 text-teal-900"
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Password Vault</span>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={toggleTheme}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border shadow-xs transition-all cursor-pointer ${
            isDark
              ? "bg-slate-900 border-slate-800 text-amber-300 hover:border-amber-400/50 hover:bg-slate-800"
              : "bg-white border-slate-300 text-slate-900 hover:border-teal-500 hover:bg-teal-50/50 shadow-sm"
          }`}
          title={isDark ? "Switch to Light Mode" : "Switch to Night Mode"}
        >
          {isDark ? (
            <>
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>Night Mode</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Main Title Section */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-6 max-w-xl px-2"
      >
        <h1
          className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          Password <span className="text-teal-600 dark:text-teal-400">Generator</span> & History
        </h1>
        <p className={`mt-1.5 text-xs sm:text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-700"}`}>
          Generate strong, secure passwords with local storage backup. Refreshes preserve your saved history!
        </p>
      </motion.div>

      {/* Main Responsive Grid: 2 Columns on Desktop, 1 Column on Mobile */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
        {/* ================= BOX 1: GENERATOR BOX ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`w-full rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl border transition-colors ${
            isDark
              ? "bg-slate-900 border-slate-800 shadow-slate-950/50"
              : "bg-white border-2 border-slate-200/90 shadow-slate-200/60"
          }`}
        >
          {/* Header & Strength Badge */}
          <div className="mb-4 sm:mb-5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                  isDark
                    ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                    : "bg-teal-100 text-teal-900 border-teal-300"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </span>
              <h2 className={`text-base sm:text-lg font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Create Password
              </h2>
            </div>

            <AnimatePresence>
              {passwordStrength && generatedPassword && (
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-xs ${strengthStyle}`}
                >
                  {passwordStrength}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Generated Password Output Box (With useRef attached to input) */}
          <div
            className={`mb-5 flex items-center justify-between gap-2.5 rounded-2xl border p-3 sm:p-4 shadow-inner transition-colors ${
              isDark
                ? "border-slate-800 bg-slate-950"
                : "border-2 border-slate-300 bg-slate-50"
            }`}
          >
            <div className="min-w-0 flex-1">
              <input
                ref={passwordInputRef}
                type="text"
                value={generatedPassword}
                readOnly
                placeholder="Click 'Generate Password' below..."
                className={`w-full bg-transparent font-mono text-base sm:text-lg font-bold outline-none selection:bg-teal-500/30 ${
                  isDark
                    ? "text-teal-400 placeholder:text-slate-500 selection:text-teal-200"
                    : "text-slate-950 placeholder:text-slate-500 selection:text-teal-900"
                } placeholder:font-sans placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal`}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={copyPassword}
              disabled={!generatedPassword}
              className="relative shrink-0 overflow-hidden rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copyMessage ? (
                  <motion.span
                    key="copied"
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1 text-white"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {copyMessage}
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Warning / Error Message */}
          <AnimatePresence>
            {passwordStrength && !generatedPassword && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-4 rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-bold ${
                  isDark
                    ? "border-amber-500/25 bg-amber-500/10 text-amber-400"
                    : "border-2 border-amber-300 bg-amber-50 text-amber-950"
                }`}
              >
                {passwordStrength}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Controls Section */}
          <div className="space-y-4">
            {/* Length Input & Range Slider (4 to 128) */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password-length"
                  className={`text-xs sm:text-sm font-bold flex items-center gap-1.5 ${
                    isDark ? "text-slate-300" : "text-slate-900"
                  }`}
                >
                  Password Length
                </label>
                <motion.span
                  key={length}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs sm:text-sm font-extrabold border ${
                    isDark
                      ? "bg-slate-950 text-teal-400 border-slate-800"
                      : "bg-teal-100 text-teal-950 border-teal-300"
                  }`}
                >
                  {length} characters
                </motion.span>
              </div>

              {/* Slider for smooth adjustment (4 to 128) */}
              <input
                type="range"
                min={4}
                max={128}
                value={length}
                onChange={(event) => setLength(Number(event.target.value))}
                className={`w-full h-2.5 mb-2 rounded-lg appearance-none cursor-pointer accent-teal-600 ${
                  isDark ? "bg-slate-800" : "bg-slate-300"
                }`}
              />

              {/* Preset Scale Markers: High Contrast in Both Themes */}
              <div className={`flex justify-between text-[11px] font-mono font-bold mb-2.5 ${isDark ? "text-slate-500" : "text-slate-700"}`}>
                <span>4 min</span>
                <span>16</span>
                <span>32</span>
                <span>64</span>
                <span>128 max</span>
              </div>

              <input
                id="password-length"
                type="number"
                min={4}
                max={128}
                value={length}
                onChange={(event) => setLength(Number(event.target.value))}
                className={`w-full rounded-xl px-4 py-2 text-sm sm:text-base font-bold outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 ${
                  isDark
                    ? "border border-slate-800 bg-slate-950 text-white"
                    : "border-2 border-slate-300 bg-white text-slate-950"
                }`}
              />
            </div>

            {/* Checkboxes Grid: 1 column on small phones, 2 columns on tablets/desktop */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
              {[
                { label: "Uppercase (A-Z)", checked: includeUppercase, onChange: toggleUppercase },
                { label: "Lowercase (a-z)", checked: includeLowercase, onChange: toggleLowercase },
                { label: "Numbers (0-9)", checked: includeNumbers, onChange: toggleNumbers },
                { label: "Symbols (!@#$)", checked: includeSymbols, onChange: toggleSymbols },
              ].map((item, index) => (
                <motion.label
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 text-xs sm:text-sm font-bold transition select-none ${
                    isDark
                      ? "border border-slate-800 bg-slate-950 text-slate-300 hover:border-teal-500/50"
                      : "border-2 border-slate-300 bg-white text-slate-900 hover:border-teal-600 hover:bg-teal-50/40 shadow-xs"
                  }`}
                >
                  <input
                    className="size-4.5 rounded accent-teal-600 cursor-pointer"
                    type="checkbox"
                    checked={item.checked}
                    onChange={item.onChange}
                  />
                  <span>{item.label}</span>
                </motion.label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleGeneratePassword}
            className="mt-5 sm:mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 px-5 py-3.5 sm:py-4 text-sm sm:text-base font-extrabold text-white shadow-lg shadow-teal-600/30 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate Password
          </motion.button>
        </motion.div>

        {/* ================= BOX 2: PASSWORD HISTORY BOX ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className={`w-full rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl flex flex-col border transition-colors ${
            isDark
              ? "bg-slate-900 border-slate-800 shadow-slate-950/50"
              : "bg-white border-2 border-slate-200/90 shadow-slate-200/60"
          }`}
        >
          {/* History Header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                  isDark
                    ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                    : "bg-teal-100 text-teal-900 border-teal-300"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <h2 className={`text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                  Generated History
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      isDark
                        ? "bg-slate-800 text-teal-300 border-slate-700"
                        : "bg-slate-200 text-slate-950 border-slate-300"
                    }`}
                  >
                    {historyStats.total}
                  </span>
                </h2>
              </div>
            </div>

            {/* Clear History Button */}
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-50 transition cursor-pointer"
                title="Clear all generated passwords"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            )}
          </div>

          {/* Search filter for history */}
          {history.length > 2 && (
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search password history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm font-semibold outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 ${
                  isDark
                    ? "border border-slate-800 bg-slate-950 text-white placeholder-slate-500"
                    : "border-2 border-slate-300 bg-white text-slate-950 placeholder-slate-500"
                }`}
              />
              <svg
                className={`absolute left-3 top-3 h-4 w-4 shrink-0 ${isDark ? "text-slate-500" : "text-slate-600"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}

          {/* History Scrollable Container (with historyContainerRef attached) */}
          <div
            ref={historyContainerRef}
            className="flex-1 max-h-[460px] min-h-[280px] sm:min-h-[320px] overflow-y-auto space-y-3 pr-1"
          >
            {filteredHistory.length === 0 ? (
              <div
                className={`flex h-full min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center ${
                  isDark ? "border-slate-800" : "border-slate-300 bg-slate-50"
                }`}
              >
                <div className={`rounded-full p-3 mb-3 ${isDark ? "bg-slate-800 text-slate-500" : "bg-slate-200 text-slate-600"}`}>
                  <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className={`text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-900"}`}>
                  {searchQuery ? "No matching passwords found" : "No passwords generated yet"}
                </h3>
                <p className={`mt-1 text-xs font-medium max-w-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}>
                  {searchQuery
                    ? "Try searching for a different keyword."
                    : "Generate your first password using the generator box on the left. It will be saved here in local storage!"}
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredHistory.map((item) => {
                  const isCopied = copiedItemId === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                      className={`group rounded-2xl p-3 sm:p-3.5 transition shadow-xs ${
                        isDark
                          ? "border border-slate-800 bg-slate-950 hover:border-slate-700"
                          : "border-2 border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
                      }`}
                    >
                      {/* Top: Password & Action Buttons (Mobile Friendly) */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`min-w-0 flex-1 truncate font-mono text-sm sm:text-base font-extrabold select-all ${
                            isDark ? "text-teal-300" : "text-slate-950"
                          }`}
                          title={item.password}
                        >
                          {item.password}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Copy Button */}
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => copyHistoryPassword(item.id, item.password)}
                            className={`p-2 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                              isCopied
                                ? isDark
                                  ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                                  : "bg-teal-100 text-teal-900 border-teal-300"
                                : isDark
                                ? "bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700"
                                : "bg-slate-100 text-slate-800 border-slate-300 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-400"
                            }`}
                            title="Copy this password"
                          >
                            {isCopied ? (
                              <>
                                <svg className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="hidden sm:inline text-[11px]">Copy</span>
                              </>
                            )}
                          </motion.button>

                          {/* Delete Item Button */}
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className={`p-2 sm:p-1.5 rounded-lg border transition cursor-pointer ${
                              isDark
                                ? "border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:border-rose-500/30"
                                : "border-slate-300 bg-slate-100 text-slate-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                            }`}
                            title="Delete this password from history"
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>

                      {/* Bottom Row: Date & Time + Badges (Responsive Wrap on Mobile) */}
                      <div
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-2 border-t text-xs ${
                          isDark ? "border-slate-900 text-slate-400" : "border-slate-200 text-slate-700"
                        }`}
                      >
                        {/* Date and Time */}
                        <div className="flex items-center gap-2 font-semibold">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {item.formattedDate}
                          </span>
                          <span className={isDark ? "text-slate-600" : "text-slate-400"}>•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.formattedTime}
                          </span>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-mono font-bold border ${
                              isDark
                                ? "bg-slate-900 text-slate-300 border-slate-800"
                                : "bg-slate-200 text-slate-900 border-slate-300"
                            }`}
                          >
                            {item.length} chars
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold border ${
                              isDark
                                ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                                : item.strength.toLowerCase().includes("very strong")
                                ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                                : item.strength.toLowerCase().includes("strong")
                                ? "bg-teal-100 text-teal-950 border-teal-300"
                                : "bg-amber-100 text-amber-950 border-amber-300"
                            }`}
                          >
                            {item.strength}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Footer note inside History Box */}
          <div
            className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold ${
              isDark ? "border-slate-800/60 text-slate-500" : "border-slate-200 text-slate-600"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Auto-saved to Local Storage
            </span>
            <span>Refreshes preserve history & theme</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GeneratedPassword;
