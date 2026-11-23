import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePasswordStore } from "../store";

const PASSWORD_PRESETS = [8, 12, 16, 24, 32, 64];
const PIN_PRESETS = [
  { label: "ATM", value: 4 },
  { label: "App / OTP", value: 6 },
  { label: "Bank App", value: 8 },
  { label: "Master PIN", value: 12 },
];

const GeneratedPassword = () => {
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileTab, setMobileTab] = useState<"generator" | "history">("generator");
  const [isRotating, setIsRotating] = useState(false);

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
    pinLength,
    setPinLength,
    generatorMode,
    setGeneratorMode,
    includeNumbers,
    toggleNumbers,
    includeSymbols,
    toggleSymbols,
    includeUppercase,
    toggleUppercase,
    includeLowercase,
    toggleLowercase,
    generatedPassword,
    generatedPin,
    passwordStrength,
    pinStrength,
    history = [],
    theme = "dark",
    toggleTheme,
    generatePassword,
    generatePin,
    deleteHistoryItem,
    clearHistory,
  } = usePasswordStore();

  const isDark = theme === "dark";
  const isPinMode = generatorMode === "pin";
  const activeOutput = isPinMode ? generatedPin : generatedPassword;

  // Generate once on initial mount ONLY if store has no password or pin yet
  useEffect(() => {
    const state = usePasswordStore.getState();
    if (!state.generatedPassword && !state.generatedPin) {
      generatePassword();
    }
  }, [generatePassword]);

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
  const strengthData = useMemo(() => {
    const lower = passwordStrength?.toLowerCase() || "";
    let score = 2;
    if (lower.includes("very strong") || lower.includes("ultra")) score = 4;
    else if (lower.includes("strong")) score = 3;
    else if (lower.includes("good") || lower.includes("standard") || lower.includes("medium")) score = 2;
    else if (lower.includes("choose") || lower.includes("weak")) score = 1;

    const colors = [
      { bg: "bg-rose-500", text: isDark ? "text-rose-400" : "text-rose-600", label: "Weak" },
      { bg: "bg-amber-500", text: isDark ? "text-amber-400" : "text-amber-600", label: "Standard" },
      { bg: "bg-teal-500", text: isDark ? "text-teal-400" : "text-teal-600", label: "Strong" },
      { bg: "bg-emerald-500", text: isDark ? "text-emerald-400" : "text-emerald-600", label: "Ultra Secure" },
    ];

    const current = colors[score - 1] || colors[1];
    return {
      score,
      label: passwordStrength || current.label,
      textColor: current.text,
      barColor: current.bg,
    };
  }, [passwordStrength, isDark]);

  // Formatted display for PIN (grouped on 1 line with clean spacing, never wraps awkwardly)
  const formattedPinDisplay = useMemo(() => {
    if (!generatedPin) return "";
    const p = generatedPin;
    if (p.length === 4) return p.split("").join("   ");
    if (p.length === 6) return `${p.slice(0, 3)}   ${p.slice(3)}`;
    if (p.length === 8) return `${p.slice(0, 4)}  •  ${p.slice(4)}`;
    if (p.length === 12) return `${p.slice(0, 4)}  •  ${p.slice(4, 8)}  •  ${p.slice(8)}`;
    if (p.length === 16) return `${p.slice(0, 4)}  •  ${p.slice(4, 8)}  •  ${p.slice(8, 12)}  •  ${p.slice(12)}`;
    return p.split("").join("  ");
  }, [generatedPin]);

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.password.toLowerCase().includes(q) ||
        item.formattedDate.toLowerCase().includes(q) ||
        item.formattedTime.toLowerCase().includes(q) ||
        item.strength.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [history, searchQuery]);

  // Statistics
  const historyStats = useMemo(() => {
    const total = history.length;
    const pinCount = history.filter((h) => h.category === "pin").length;
    const pwdCount = total - pinCount;
    return { total, pinCount, pwdCount };
  }, [history]);

  // Syntax highlighting for passwords
  const renderedPasswordTokens = useMemo(() => {
    if (!generatedPassword || isPinMode) return null;

    return generatedPassword.split("").map((char, index) => {
      let color = isDark ? "text-slate-100" : "text-slate-800";
      if (/[0-9]/.test(char)) {
        color = isDark ? "text-cyan-400 font-bold" : "text-cyan-700 font-bold";
      } else if (/[^a-zA-Z0-9]/.test(char)) {
        color = isDark ? "text-rose-400 font-black" : "text-rose-600 font-black";
      } else if (/[A-Z]/.test(char)) {
        color = isDark ? "text-emerald-400 font-bold" : "text-emerald-700 font-bold";
      }
      return (
        <span key={index} className={color}>
          {char}
        </span>
      );
    });
  }, [generatedPassword, isPinMode, isDark]);

  // ========================================================
  // 3. useCallback Hooks
  // ========================================================
  const copyPassword = useCallback(async () => {
    if (!activeOutput) return;

    passwordInputRef.current?.select();
    passwordInputRef.current?.setSelectionRange(0, 99999);

    try {
      await navigator.clipboard.writeText(activeOutput);
      setCopyMessage("Copied!");

      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopyMessage("");
      }, 2000);
    } catch {
      setCopyMessage("Failed");
    }
  }, [activeOutput]);

  const copyHistoryPassword = useCallback(async (id: string, password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedItemId(id);

      if (historyCopyTimeoutRef.current) clearTimeout(historyCopyTimeoutRef.current);
      historyCopyTimeoutRef.current = setTimeout(() => {
        setCopiedItemId(null);
      }, 2000);
    } catch {
      // ignore
    }
  }, []);

  const handleGenerate = useCallback(() => {
    setIsRotating(true);
    if (isPinMode) {
      generatePin();
    } else {
      generatePassword();
    }
    setTimeout(() => setIsRotating(false), 300);

    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isPinMode, generatePin, generatePassword]);

  const handleModeSwitch = useCallback(
    (mode: "password" | "pin") => {
      setGeneratorMode(mode);
    },
    [setGeneratorMode]
  );

  const handleDeleteItem = useCallback(
    (id: string) => {
      deleteHistoryItem(id);
    },
    [deleteHistoryItem]
  );

  const handleClearHistory = useCallback(() => {
    if (window.confirm("Clear all generated password & PIN history?")) {
      clearHistory();
    }
  }, [clearHistory]);

  const adjustLength = useCallback(
    (delta: number) => {
      if (isPinMode) {
        setPinLength(Math.min(16, Math.max(4, pinLength + delta)));
      } else {
        setLength(Math.min(128, Math.max(4, length + delta)));
      }
    },
    [isPinMode, pinLength, length, setPinLength, setLength]
  );

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-500 font-sans relative flex flex-col items-center px-3.5 py-4 sm:px-6 sm:py-8 overflow-x-hidden ${
        isDark ? "bg-[#090D16] text-slate-100" : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className={`absolute left-1/2 top-0 h-105 w-225 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px] transition-opacity duration-700 ${
            isDark ? "bg-teal-500/15 opacity-100" : "bg-teal-500/10 opacity-70"
          }`}
        />
      </div>

      {/* ================= TOPBAR ================= */}
      <header className="w-full max-w-6xl mb-4 sm:mb-6">
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-inner border transition-all ${
                isDark
                  ? "bg-slate-900/90 border-teal-500/30 text-teal-400 shadow-teal-500/10"
                  : "bg-white border-teal-200 text-teal-600 shadow-teal-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight truncate">
                  Secure<span className="text-teal-500">Vault</span>
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider shrink-0 border ${
                    isDark
                      ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      : "bg-teal-50 text-teal-700 border-teal-200"
                  }`}
                >
                  PRO
                </span>
              </div>
              <p className={`text-[11px] truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Password &amp; PIN Studio
              </p>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition shadow-xs cursor-pointer shrink-0 ${
              isDark
                ? "bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300"
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <>
                <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="mt-3.5 flex lg:hidden w-full">
          <div
            className={`flex w-full p-1 rounded-2xl border text-xs font-bold ${
              isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-xs"
            }`}
          >
            <button
              type="button"
              onClick={() => setMobileTab("generator")}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === "generator"
                  ? "bg-teal-600 text-white shadow-xs"
                  : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Generator</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("history")}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === "history"
                  ? "bg-teal-600 text-white shadow-xs"
                  : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Saved History</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  mobileTab === "history"
                    ? "bg-teal-700 text-white"
                    : isDark
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {historyStats.total}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO TITLE ================= */}
      <section className="w-full max-w-6xl text-center mb-5 sm:mb-8 px-1">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2.5 border shadow-xs ${
            isDark
              ? "bg-teal-500/10 border-teal-500/25 text-teal-400"
              : "bg-teal-50 border-teal-300 text-teal-800"
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Ultra-Secure Client-Side Security</span>
        </div>

        <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-snug wrap-break-word">
          Strong Password &amp; <span className="text-teal-500">Random PIN</span> Generator
        </h1>
        <p className={`mt-1.5 text-xs sm:text-sm max-w-xl mx-auto font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Generate cryptographically strong passwords and numeric ATM/App PINs instantly. Saved locally in your browser.
        </p>
      </section>

      {/* ================= MAIN DASHBOARD (50% / 50% BALANCED GRID) ================= */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
        {/* ================= CARD 1: GENERATOR ================= */}
        <section
          className={`w-full rounded-3xl border transition-all duration-300 p-4 sm:p-6 shadow-xl flex flex-col ${
            mobileTab === "history" ? "hidden lg:flex" : "flex"
          } ${
            isDark
              ? "bg-slate-900/70 backdrop-blur-xl border-slate-800/80 shadow-black/40"
              : "bg-white/95 backdrop-blur-xl border-slate-200/90 shadow-slate-200/70"
          }`}
        >
          {/* Mode Switcher Tabs */}
            <div
              className={`p-1.5 rounded-2xl border mb-4 sm:mb-5 flex items-center gap-1.5 ${
                isDark ? "bg-[#060910] border-slate-800" : "bg-slate-100 border-slate-200"
              }`}
            >
              <button
                type="button"
                onClick={() => handleModeSwitch("password")}
                className={`flex-1 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                  !isPinMode
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Password Mode</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeSwitch("pin")}
                className={`flex-1 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                  isPinMode
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/30"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span>Random PIN Mode</span>
              </button>
            </div>

            {/* Subheader info */}
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {isPinMode ? "Generated Numeric PIN" : "Generated Password"}
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${strengthData.textColor}`}>
                  {isPinMode ? (pinStrength || `${pinLength}-Digit Numeric PIN`) : strengthData.label}
                </span>
              </div>
            </div>

            {/* Hero Display Box (Never wraps awkwardly, single unified line!) */}
            <div
              className={`relative rounded-2xl border p-4 sm:p-5 transition-all mb-4 ${
                isDark
                  ? "bg-[#060910] border-slate-800 shadow-inner"
                  : "bg-slate-50 border-slate-200 shadow-inner"
              }`}
            >
              <input
                ref={passwordInputRef}
                type="text"
                readOnly
                value={activeOutput}
                aria-label={isPinMode ? "Generated PIN" : "Generated Password"}
                className="absolute opacity-0 pointer-events-none"
              />

              <div className="flex items-center justify-between gap-3">
                {/* Center / Left display */}
                <div className="min-w-0 flex-1 overflow-x-auto py-1 scrollbar-none font-mono select-all">
                  {isPinMode ? (
                    <div
                      className={`text-xl sm:text-2xl md:text-3xl font-black tracking-wider truncate ${
                        isDark ? "text-teal-300" : "text-teal-700"
                      }`}
                    >
                      {formattedPinDisplay || "----"}
                    </div>
                  ) : (
                    <div className="text-base sm:text-xl font-bold tracking-wider truncate">
                      {renderedPasswordTokens || (
                        <span className={`text-sm font-normal ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                          Tap generate below...
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Regenerate + Copy Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    type="button"
                    onClick={handleGenerate}
                    className={`p-2.5 rounded-xl border transition cursor-pointer ${
                      isDark
                        ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:text-teal-400 hover:border-teal-500/40"
                        : "bg-white border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-300 shadow-xs"
                    }`}
                    title={isPinMode ? "Generate new PIN" : "Generate new password"}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${isRotating ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={copyPassword}
                    disabled={!activeOutput}
                    className="px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-xs font-bold transition shadow-md shadow-teal-600/20 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {copyMessage ? (
                        <motion.span
                          key="copied"
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          className="flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Copied!</span>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ opacity: 0, y: 3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          className="flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </div>

              {/* Segmented Strength Bar ONLY for Password mode */}
              {!isPinMode && (
                <div className="mt-3.5 flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((bar) => {
                    const isActive = bar <= strengthData.score;
                    return (
                      <div
                        key={bar}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          isActive
                            ? strengthData.barColor
                            : isDark
                            ? "bg-slate-800"
                            : "bg-slate-200"
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* ================= CONTROLS SECTION ================= */}
            {isPinMode ? (
              /* CLEAN PIN CONTROLS (Zero clutter) */
              <div className="space-y-4">
                {/* Standard PIN Formats Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2 px-0.5">
                    <span className="text-xs sm:text-sm font-bold">Standard PIN Lengths</span>
                    <span
                      className={`font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${
                        isDark ? "bg-slate-800 text-teal-400 border-slate-700" : "bg-teal-50 text-teal-700 border-teal-200"
                      }`}
                    >
                      {pinLength} Digits
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PIN_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPinLength(p.value)}
                        className={`p-3 rounded-2xl text-xs font-bold border transition text-center cursor-pointer flex flex-col items-center gap-1 ${
                          pinLength === p.value
                            ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 scale-[1.02]"
                            : isDark
                            ? "bg-[#060910] text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900 shadow-xs"
                        }`}
                      >
                        <span className="text-sm font-black">{p.value} Digits</span>
                        <span className="text-[10px] font-medium opacity-80">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom length slider */}
                <div
                  className={`p-3 sm:p-4 rounded-2xl border ${
                    isDark ? "bg-[#060910]/80 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      Custom Range (4 to 16 digits)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustLength(-1)}
                        className={`h-6 w-6 rounded-md border flex items-center justify-center font-mono font-bold text-xs transition cursor-pointer ${
                          isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        -
                      </button>
                      <span className="text-xs font-mono font-black text-teal-500 min-w-5 text-center">{pinLength}</span>
                      <button
                        type="button"
                        onClick={() => adjustLength(1)}
                        className={`h-6 w-6 rounded-md border flex items-center justify-center font-mono font-bold text-xs transition cursor-pointer ${
                          isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={16}
                    value={pinLength}
                    onChange={(e) => setPinLength(Number(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-500 transition ${
                      isDark ? "bg-slate-800" : "bg-slate-200"
                    }`}
                  />
                </div>

                {/* Generate PIN button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGenerate}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 active:from-teal-600 active:to-emerald-700 text-white font-black text-sm sm:text-base shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  <span>Generate Random PIN ({pinLength} Digits)</span>
                </motion.button>
              </div>
            ) : (
              /* PASSWORD CONTROLS */
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-bold">Password Length</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustLength(-1)}
                        className={`h-7 w-7 rounded-lg border flex items-center justify-center font-mono font-bold text-xs transition cursor-pointer ${
                          isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        -
                      </button>
                      <span
                        className={`font-mono text-xs sm:text-sm font-extrabold px-3 py-1 rounded-lg border ${
                          isDark ? "bg-slate-800 text-teal-400 border-slate-700" : "bg-teal-50 text-teal-700 border-teal-200"
                        }`}
                      >
                        {length} Chars
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustLength(1)}
                        className={`h-7 w-7 rounded-lg border flex items-center justify-center font-mono font-bold text-xs transition cursor-pointer ${
                          isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={4}
                    max={128}
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-500 transition ${
                      isDark ? "bg-slate-800" : "bg-slate-200"
                    }`}
                  />

                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className={`text-[11px] font-medium mr-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      Presets:
                    </span>
                    {PASSWORD_PRESETS.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLength(val)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition cursor-pointer border ${
                          length === val
                            ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                            : isDark
                            ? "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
                            : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs sm:text-sm font-bold block mb-2">Character Types</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "upper", label: "Uppercase", sub: "A-Z", checked: includeUppercase, onChange: toggleUppercase },
                      { id: "lower", label: "Lowercase", sub: "a-z", checked: includeLowercase, onChange: toggleLowercase },
                      { id: "numbers", label: "Numbers", sub: "0-9", checked: includeNumbers, onChange: toggleNumbers },
                      { id: "symbols", label: "Symbols", sub: "!@#$", checked: includeSymbols, onChange: toggleSymbols },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.onChange}
                        className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          item.checked
                            ? isDark
                              ? "bg-teal-500/10 border-teal-500/40 text-slate-100 shadow-xs"
                              : "bg-teal-50 border-teal-300 text-teal-950 shadow-xs"
                            : isDark
                            ? "bg-slate-800/40 border-slate-800 text-slate-500 hover:border-slate-700"
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] font-mono opacity-80">{item.sub}</div>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-lg flex items-center justify-center transition-all ${
                            item.checked
                              ? "bg-teal-600 text-white"
                              : isDark
                              ? "bg-slate-800 text-transparent"
                              : "bg-slate-100 text-transparent"
                          }`}
                        >
                          <svg className="w-3 h-3 stroke-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGenerate}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-linear-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 active:from-teal-600 active:to-emerald-700 text-white font-black text-sm sm:text-base shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Generate Secure Password</span>
                </motion.button>
              </div>
            )}
        </section>

        {/* ================= CARD 2: SAVED HISTORY ================= */}
        <section
          className={`w-full rounded-3xl border transition-all duration-300 p-4 sm:p-6 shadow-xl flex flex-col ${
            mobileTab === "generator" ? "hidden lg:flex" : "flex"
          } ${
            isDark
              ? "bg-slate-900/70 backdrop-blur-xl border-slate-800/80 shadow-black/40"
              : "bg-white/95 backdrop-blur-xl border-slate-200/90 shadow-slate-200/70"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                  Saved History
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    isDark ? "bg-slate-800 text-teal-400 border-slate-700" : "bg-teal-50 text-teal-700 border-teal-200"
                  }`}
                >
                  {historyStats.total} Saved
                </span>
              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* Search bar */}
            {history.length > 2 && (
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search password, pin, date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-xl pl-9 pr-4 py-2.5 text-xs font-semibold outline-none transition border ${
                    isDark
                      ? "bg-[#060910] border-slate-800 text-white placeholder-slate-500 focus:border-teal-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500"
                  }`}
                />
                <svg
                  className={`w-4 h-4 absolute left-3 top-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}

            {/* Scrollable list container with custom sleek scrollbar */}
            <div
              ref={historyContainerRef}
              className="flex-1 min-h-85 max-h-115 sm:max-h-125 overflow-y-auto space-y-2.5 pr-1.5 pt-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/40 [&::-webkit-scrollbar-thumb]:rounded-full"
            >
              {filteredHistory.length === 0 ? (
                <div
                  className={`flex h-full min-h-70 flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center ${
                    isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"
                  }`}
                >
                  <div className={`p-3 rounded-2xl mb-2.5 ${isDark ? "bg-slate-800/60" : "bg-slate-100"}`}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-slate-400">
                    {searchQuery ? "No matches found" : "No items generated yet"}
                  </p>
                  <p className="text-[11px] mt-1 max-w-50">
                    {searchQuery
                      ? "Try searching for a different keyword."
                      : "Generated passwords & PINs will be safely stored here."}
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {filteredHistory.map((item) => {
                    const isCopied = copiedItemId === item.id;
                    const isItemPin = item.category === "pin";

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`group p-3 sm:p-3.5 rounded-2xl border transition-all ${
                          isDark
                            ? "bg-[#060910]/95 border-slate-800/90 hover:border-slate-700 shadow-sm"
                            : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                        }`}
                      >
                        {/* Password / PIN Line + Quick Actions */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase shrink-0 border ${
                                isItemPin
                                  ? isDark
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                    : "bg-amber-50 text-amber-700 border-amber-200"
                                  : isDark
                                  ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                                  : "bg-teal-50 text-teal-700 border-teal-200"
                              }`}
                            >
                              {isItemPin ? "PIN" : "PASS"}
                            </span>
                            <span
                              className={`font-mono text-xs sm:text-sm font-bold truncate select-all ${
                                isDark ? "text-slate-100" : "text-slate-900"
                              }`}
                              title={item.password}
                            >
                              {item.password}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Copy button */}
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => copyHistoryPassword(item.id, item.password)}
                              className={`p-1.5 rounded-lg border text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                isCopied
                                  ? isDark
                                    ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                                    : "bg-teal-100 text-teal-900 border-teal-300"
                                  : isDark
                                  ? "bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:text-slate-900"
                              }`}
                              title="Copy to clipboard"
                            >
                              {isCopied ? (
                                <>
                                  <svg className="w-3 h-3 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Copied</span>
                                </>
                              ) : (
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </motion.button>

                            {/* Delete button */}
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => handleDeleteItem(item.id)}
                              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                isDark
                                  ? "border-slate-800 bg-slate-800/40 text-slate-500 hover:text-rose-400 hover:border-rose-500/30"
                                  : "border-slate-200 bg-slate-50 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                              }`}
                              title="Delete entry"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </motion.button>
                          </div>
                        </div>

                        {/* Timestamp & Badges footer */}
                        <div
                          className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-[10px] ${
                            isDark ? "border-slate-800/80 text-slate-500" : "border-slate-100 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-medium">
                            <span className="flex items-center gap-0.5">
                              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {item.formattedDate}
                            </span>
                            <span>•</span>
                            <span>{item.formattedTime}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span
                              className={`px-1.5 py-0.2 rounded font-mono font-bold ${
                                isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.length} {isItemPin ? "digits" : "chars"}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold ${
                                item.strength.toLowerCase().includes("very") || item.strength.toLowerCase().includes("ultra")
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : item.strength.toLowerCase().includes("strong")
                                  ? "bg-teal-500/10 text-teal-400"
                                  : "bg-amber-500/10 text-amber-400"
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

            {/* Footer status */}
            <div
              className={`mt-4 pt-3 border-t text-[11px] flex items-center justify-between ${
                isDark ? "border-slate-800/80 text-slate-500" : "border-slate-100 text-slate-400"
              }`}
            >
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Auto-saved to Local Storage
              </span>
              <span className="hidden sm:inline">Encrypted in browser</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default GeneratedPassword;
