import { create } from "zustand";

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

type PasswordState = {
    length: number;
    includeNumbers: boolean;
    includeSymbols: boolean;
    includeUppercase: boolean;
    includeLowercase: boolean;
    generatedPassword: string;
    passwordStrength: string;
    setLength: (length: number) => void;
    toggleNumbers: () => void;
    toggleSymbols: () => void;
    toggleUppercase: () => void;
    toggleLowercase: () => void;
    generatePassword: () => void;

}



export const usePasswordStore = create<PasswordState>((set) => ({
    length: 12,
    includeNumbers: true,
    includeSymbols: true,
    includeUppercase: true,
    includeLowercase: true,
    generatedPassword: "",
    passwordStrength: "",

    setLength: (length) => set({ length: Math.min(128, Math.max(4, length || 4)) }),
    toggleNumbers: () => set((state) => ({ includeNumbers: !state.includeNumbers })),
    toggleSymbols: () => set((state) => ({ includeSymbols: !state.includeSymbols })),
    toggleUppercase: () => set((state) => ({ includeUppercase: !state.includeUppercase })),
    toggleLowercase: () => set((state) => ({ includeLowercase: !state.includeLowercase })),

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

      return { generatedPassword: password, passwordStrength };
        }),
    }));
