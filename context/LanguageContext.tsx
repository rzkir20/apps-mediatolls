import AsyncStorage from "@react-native-async-storage/async-storage";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import languageData from "@/lib/language.json";

export type AppLanguage = "id" | "en";

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (nextLanguage: AppLanguage) => Promise<void>;
  isLanguageReady: boolean;
};

const STORAGE_KEY_APP_LANGUAGE = "@mediatools_app_language";
const DEFAULT_LANGUAGE = languageData.default as AppLanguage;

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  useEffect(() => {
    const hydrateLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem(
          STORAGE_KEY_APP_LANGUAGE,
        );
        if (storedLanguage === "id" || storedLanguage === "en") {
          setLanguageState(storedLanguage);
        } else {
          await AsyncStorage.setItem(
            STORAGE_KEY_APP_LANGUAGE,
            DEFAULT_LANGUAGE,
          );
        }
      } finally {
        setIsLanguageReady(true);
      }
    };

    hydrateLanguage();
  }, []);

  const setLanguage = async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(STORAGE_KEY_APP_LANGUAGE, nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      isLanguageReady,
    }),
    [isLanguageReady, language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
