import { create } from "zustand";
import { persist } from "zustand/middleware";

const secureRandomIndex = (max: number) => {
    const limit = Math.floor(0x100000000 / max) * max;
    const randomValue = new Uint32Array(1);

    do {
        crypto.getRandomValues(randomValue);
    } while (randomValue[0] >= limit);

    return randomValue[0] % max;
};

const shuffle = (items: string[]) => {
    for (let index = items.length - 1; index > 0; index -= 1) {
        const randomIndex = secureRandomIndex(index + 1);
        [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
    }
    return items;
};

export interface PasswordHistoryItem {
    id: string;
    password: string;
    strength: string;
    length: number;
    timestamp: number;
    formattedDate: string;
    formattedTime: string;
    category?: "password" | "pin";
}

type PasswordState = {
    length: number;
    pinLength: number;
    generatorMode: "password" | "pin";
    includeNumbers: boolean;
    includeSymbols: boolean;
    includeUppercase: boolean;
    includeLowercase: boolean;
    generatedPassword: string;
    generatedPin: string;
    passwordStrength: string;
    pinStrength: string;
    history: PasswordHistoryItem[];
    theme: "dark" | "light";
    setLength: (length: number) => void;
    setPinLength: (len: number) => void;
    setGeneratorMode: (mode: "password" | "pin") => void;
    toggleNumbers: () => void;
    toggleSymbols: () => void;
    toggleUppercase: () => void;
    toggleLowercase: () => void;
    toggleTheme: () => void;
    generatePassword: () => void;
    generatePin: () => void;
    deleteHistoryItem: (id: string) => void;
    clearHistory: () => void;
};

export const usePasswordStore = create<PasswordState>()(
    persist(
        (set) => ({
            length: 16,
            pinLength: 6,
            generatorMode: "password",
            includeNumbers: true,
            includeSymbols: true,
            includeUppercase: true,
            includeLowercase: true,
            generatedPassword: "",
            generatedPin: "",
            passwordStrength: "",
            pinStrength: "",
            history: [],
            theme: "dark",

            setLength: (length) => set({ length: Math.min(128, Math.max(4, length || 4)) }),
            setPinLength: (pinLength) => set({ pinLength: Math.min(16, Math.max(4, pinLength || 4)) }),
            setGeneratorMode: (generatorMode) => set({ generatorMode }),
            toggleNumbers: () => set((state) => ({ includeNumbers: !state.includeNumbers })),
            toggleSymbols: () => set((state) => ({ includeSymbols: !state.includeSymbols })),
            toggleUppercase: () => set((state) => ({ includeUppercase: !state.includeUppercase })),
            toggleLowercase: () => set((state) => ({ includeLowercase: !state.includeLowercase })),
            toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),

            generatePassword: () => set((state) => {
                const numbers = "0123456789";
                const symbols = "!@#$%^&*()_+[]{}|;:,.<>?";
                const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                const lowercase = "abcdefghijklmnopqrstuvwxyz";

                const selectedGroups = [
                    state.includeNumbers ? numbers : "",
                    state.includeSymbols ? symbols : "",
                    state.includeUppercase ? uppercase : "",
                    state.includeLowercase ? lowercase : "",
                ].filter(Boolean);

                if (selectedGroups.length === 0) {
                    return {
                        generatedPassword: "",
                        passwordStrength: "Choose at least one character type.",
                    };
                }

                const characters = selectedGroups.join("");
                const passwordCharacters = selectedGroups.map(
                    (group) => group[secureRandomIndex(group.length)],
                );

                while (passwordCharacters.length < state.length) {
                    passwordCharacters.push(characters[secureRandomIndex(characters.length)]);
                }

                const password = shuffle(passwordCharacters).join("");
                const score =
                    (state.length >= 12 ? 1 : 0) +
                    (state.length >= 16 ? 1 : 0) +
                    Math.max(0, selectedGroups.length - 1);
                const passwordStrength = score >= 4 ? "Very strong" : score >= 3 ? "Strong" : "Good";

                const now = new Date();
                const formattedDate = now.toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                });
                const formattedTime = now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                });

                const newHistoryItem: PasswordHistoryItem = {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                    password,
                    strength: passwordStrength,
                    length: state.length,
                    timestamp: now.getTime(),
                    formattedDate,
                    formattedTime,
                    category: "password",
                };

                return {
                    generatedPassword: password,
                    passwordStrength,
                    history: [newHistoryItem, ...(state.history || [])],
                };
            }),

            generatePin: () => set((state) => {
                const pinLen = Math.min(16, Math.max(4, state.pinLength || 6));
                const digits = "0123456789";
                let pin = "";
                for (let i = 0; i < pinLen; i++) {
                    pin += digits[secureRandomIndex(digits.length)];
                }

                const pinStrength =
                    pinLen >= 8 ? "Ultra Secure PIN" : pinLen >= 6 ? "Strong 6-Digit PIN" : "Standard 4-Digit PIN";

                const now = new Date();
                const formattedDate = now.toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                });
                const formattedTime = now.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                });

                const newHistoryItem: PasswordHistoryItem = {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                    password: pin,
                    strength: pinStrength,
                    length: pinLen,
                    timestamp: now.getTime(),
                    formattedDate,
                    formattedTime,
                    category: "pin",
                };

                return {
                    generatedPin: pin,
                    pinStrength,
                    history: [newHistoryItem, ...(state.history || [])],
                };
            }),

            deleteHistoryItem: (id: string) =>
                set((state) => ({
                    history: (state.history || []).filter((item) => item.id !== id),
                })),

            clearHistory: () => set({ history: [] }),
        }),
        {
            name: "password-generator-data",
        }
    )
);
