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
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const historyContainerRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (historyCopyTimeoutRef.current) clearTimeout(historyCopyTimeoutRef.current);
    };
  }, []);

  // ========================================================
  // 2. useMemo Hooks
  // ========================================================
  const strengthStyle = useMemo(() => {
    const lower = passwordStrength?.toLowerCase() || "";
    if (lower.includes("very strong"))
      return isDark
        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
        : "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (lower.includes("strong"))
      return isDark
        ? "bg-teal-500/15 text-teal-400 border-teal-500/30"
        : "bg-teal-100 text-teal-800 border-teal-300";
    if (lower.includes("good") || lower.includes("medium"))
      return isDark
        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
        : "bg-amber-100 text-amber-800 border-amber-300";
    return isDark
      ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
      : "bg-rose-100 text-rose-800 border-rose-300";
  }, [passwordStrength, isDark]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (i) =>
        i.password.toLowerCase().includes(q) ||
        i.formattedDate.toLowerCase().includes(q) ||
        i.formattedTime.toLowerCase().includes(q) ||
        i.strength.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const historyStats = useMemo(() => {
    return { total: history.length };
  }, [history]);

  // ========================================================
  // 3. useCallback Hooks
  // ========================================================
  const copyPassword = useCallback(async () => {
    if (!generatedPassword) return;
    passwordInputRef.current?.select();
    passwordInputRef.current?.setSelectionRange(0, 99999);
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopyMessage("Copied!");
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopyMessage(""), 2000);
    } catch {
      setCopyMessage("Failed!");
    }
  }, [generatedPassword]);

  const copyHistoryPassword = useCallback(async (id: string, password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedItemId(id);
      if (historyCopyTimeoutRef.current) clearTimeout(historyCopyTimeoutRef.current);
      historyCopyTimeoutRef.current = setTimeout(() => setCopiedItemId(null), 2000);
    } catch { /* ignore */ }
  }, []);

  const handleGeneratePassword = useCallback(() => {
    generatePassword();
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [generatePassword]);

  const handleDeleteItem = useCallback(
    (id: string) => deleteHistoryItem(id),
    [deleteHistoryItem]
  );

  const handleClearHistory = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all password history?")) clearHistory();
  }, [clearHistory]);

  // ========================================================
  // Shared tiny classes
  // ========================================================
  const cardClass = isDark
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-200 shadow-md shadow-slate-200/50";
  const inputBgClass = isDark
    ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400";
  const mutedText = isDark ? "text-slate-400" : "text-slate-500";
  const headingText = isDark ? "text-white" : "text-slate-900";

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 px-3 py-4 sm:px-5 sm:py-6 flex flex-col items-center ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-gray-100 text-slate-900"
      }`}
    >
      {/* =================== COMPACT HEADER =================== */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-5xl rounded-2xl px-4 sm:px-6 py-4 sm:py-5 mb-4 sm:mb-5 border ${cardClass}`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left: Lock icon + Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                isDark
                  ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
                  : "bg-teal-50 border-teal-200 text-teal-600"
              }`}
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <div className="min-w-0">
              <h1 className={`text-base sm:text-lg font-bold tracking-tight leading-tight ${headingText}`}>
                Password <span className={isDark ? "text-teal-400" : "text-teal-600"}>Generator</span>
              </h1>
              <p className={`text-[11px] sm:text-xs font-medium leading-tight ${mutedText}`}>
                Auto-saved to local storage · Refresh safe
              </p>
            </div>
          </div>

          {/* Right: Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold border transition cursor-pointer shrink-0 ${
              isDark
                ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isDark ? (
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
          </motion.button>
        </div>
      </motion.header>

      {/* =================== MAIN 2-COL GRID =================== */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">

        {/* ======== BOX 1: GENERATOR ======== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`rounded-2xl p-4 sm:p-5 border ${cardClass}`}
        >
          {/* Sub-header */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                  isDark ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-teal-50 text-teal-600 border-teal-200"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </span>
              <h2 className={`text-sm font-bold ${headingText}`}>Create Password</h2>
            </div>
            <AnimatePresence>
              {passwordStrength && generatedPassword && (
                <motion.span
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${strengthStyle}`}
                >
                  {passwordStrength}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Password display */}
          <div
            className={`mb-4 flex items-center gap-2 rounded-xl border p-2.5 sm:p-3 ${
              isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"
            }`}
          >
            <input
              ref={passwordInputRef}
              type="text"
              value={generatedPassword}
              readOnly
              placeholder="Click Generate below..."
              className={`min-w-0 flex-1 bg-transparent font-mono text-sm font-semibold outline-none selection:bg-teal-500/30 ${
                isDark ? "text-teal-400 placeholder:text-slate-500" : "text-slate-900 placeholder:text-slate-400"
              } placeholder:font-sans placeholder:text-xs placeholder:font-normal`}
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={copyPassword}
              disabled={!generatedPassword}
              className="shrink-0 rounded-lg bg-teal-600 hover:bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copyMessage ? (
                  <motion.span key="done" initial={{ y: 4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -4, opacity: 0 }} transition={{ duration: 0.12 }} className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    {copyMessage}
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ y: 4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -4, opacity: 0 }} transition={{ duration: 0.12 }} className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Warning */}
          <AnimatePresence>
            {passwordStrength && !generatedPassword && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-3 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  isDark ? "border-amber-500/25 bg-amber-500/10 text-amber-400" : "border-amber-300 bg-amber-50 text-amber-800"
                }`}
              >
                {passwordStrength}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="space-y-3">
            {/* Length */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="pw-len" className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Password Length
                </label>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                  isDark ? "bg-slate-800 text-teal-400 border-slate-700" : "bg-teal-50 text-teal-700 border-teal-200"
                }`}>
                  {length}
                </span>
              </div>
              <input
                type="range" min={4} max={128} value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className={`w-full h-1.5 mb-1 rounded-full appearance-none cursor-pointer accent-teal-500 ${isDark ? "bg-slate-700" : "bg-slate-200"}`}
              />
              <div className={`flex justify-between text-[10px] font-mono mb-2 ${mutedText}`}>
                <span>4</span><span>32</span><span>64</span><span>128</span>
              </div>
              <input
                id="pw-len" type="number" min={4} max={128} value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className={`w-full rounded-lg border px-3 py-1.5 text-xs font-semibold outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 ${inputBgClass}`}
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Uppercase (A-Z)", checked: includeUppercase, onChange: toggleUppercase },
                { label: "Lowercase (a-z)", checked: includeLowercase, onChange: toggleLowercase },
                { label: "Numbers (0-9)", checked: includeNumbers, onChange: toggleNumbers },
                { label: "Symbols (!@#$)", checked: includeSymbols, onChange: toggleSymbols },
              ].map((item, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-xs font-semibold cursor-pointer select-none transition ${
                    isDark
                      ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-teal-500/40"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-400"
                  }`}
                >
                  <input type="checkbox" checked={item.checked} onChange={item.onChange} className="size-3.5 rounded accent-teal-500 cursor-pointer" />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Generate btn */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGeneratePassword}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate Password
          </motion.button>
        </motion.div>

        {/* ======== BOX 2: HISTORY ======== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className={`rounded-2xl p-4 sm:p-5 border flex flex-col ${cardClass}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                isDark ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-teal-50 text-teal-600 border-teal-200"
              }`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h2 className={`text-sm font-bold ${headingText}`}>
                History
                <span className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isDark ? "bg-slate-800 text-teal-300 border border-slate-700" : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}>
                  {historyStats.total}
                </span>
              </h2>
            </div>
            {history.length > 0 && (
              <button type="button" onClick={handleClearHistory}
                className={`text-[11px] font-semibold flex items-center gap-1 px-2 py-1 rounded-md border transition cursor-pointer ${
                  isDark
                    ? "text-rose-400 border-rose-500/20 hover:bg-rose-500/10"
                    : "text-rose-600 border-rose-200 hover:bg-rose-50"
                }`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Clear All
              </button>
            )}
          </div>

          {/* Search */}
          {history.length > 2 && (
            <div className="relative mb-2.5">
              <input
                type="text" placeholder="Search..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs font-medium outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 ${inputBgClass}`}
              />
              <svg className={`absolute left-2.5 top-2 h-3.5 w-3.5 ${mutedText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}

          {/* List */}
          <div ref={historyContainerRef} className="flex-1 max-h-[420px] min-h-[260px] overflow-y-auto space-y-2 pr-0.5">
            {filteredHistory.length === 0 ? (
              <div className={`flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center ${
                isDark ? "border-slate-800" : "border-slate-200"
              }`}>
                <div className={`rounded-full p-2.5 mb-2 ${isDark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {searchQuery ? "No matches found" : "No passwords yet"}
                </p>
                <p className={`text-[11px] mt-0.5 ${mutedText}`}>
                  {searchQuery ? "Try different keywords." : "Generate a password to see it here."}
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filteredHistory.map((item) => {
                  const isCopied = copiedItemId === item.id;
                  return (
                    <motion.div
                      key={item.id} layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
                      className={`rounded-xl border p-2.5 transition ${
                        isDark
                          ? "border-slate-800 bg-slate-800/50 hover:border-slate-700"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {/* Password row */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`min-w-0 flex-1 truncate font-mono text-xs font-bold select-all ${
                          isDark ? "text-teal-300" : "text-slate-900"
                        }`} title={item.password}>
                          {item.password}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <motion.button whileTap={{ scale: 0.9 }} type="button"
                            onClick={() => copyHistoryPassword(item.id, item.password)}
                            className={`p-1.5 rounded-md border text-[11px] font-semibold transition cursor-pointer flex items-center gap-0.5 ${
                              isCopied
                                ? isDark ? "bg-teal-500/20 text-teal-300 border-teal-500/40" : "bg-teal-100 text-teal-800 border-teal-300"
                                : isDark ? "bg-slate-800 text-slate-400 border-slate-700 hover:text-white" : "bg-white text-slate-500 border-slate-200 hover:text-teal-700 hover:border-teal-300"
                            }`}>
                            {isCopied ? (
                              <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg><span className="hidden sm:inline">Copied</span></>
                            ) : (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            )}
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }} type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className={`p-1.5 rounded-md border transition cursor-pointer ${
                              isDark ? "border-slate-700 bg-slate-800 text-slate-500 hover:text-rose-400" : "border-slate-200 bg-white text-slate-400 hover:text-rose-600"
                            }`}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </motion.button>
                        </div>
                      </div>
                      {/* Meta row */}
                      <div className={`flex flex-wrap items-center justify-between gap-1 pt-1.5 border-t text-[10px] ${
                        isDark ? "border-slate-700/60 text-slate-500" : "border-slate-200 text-slate-500"
                      }`}>
                        <div className="flex items-center gap-1.5 font-medium">
                          <span className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            {item.formattedDate}
                          </span>
                          <span className={isDark ? "text-slate-700" : "text-slate-300"}>•</span>
                          <span className="flex items-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {item.formattedTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`rounded px-1.5 py-px font-mono font-bold border ${
                            isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>{item.length} chars</span>
                          <span className={`rounded px-1.5 py-px font-bold border ${
                            isDark ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                              : item.strength.toLowerCase().includes("very") ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : item.strength.toLowerCase().includes("strong") ? "bg-teal-100 text-teal-800 border-teal-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }`}>{item.strength}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] font-medium ${
            isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"
          }`}>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Auto-saved to Local Storage
            </span>
            <span>Refresh safe</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GeneratedPassword;
