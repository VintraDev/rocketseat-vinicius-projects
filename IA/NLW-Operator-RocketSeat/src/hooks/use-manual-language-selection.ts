"use client";

import { useCallback, useState } from "react";
import type { SupportedLanguage } from "@/lib/syntax-highlighting";

interface UseManualLanguageSelectionReturn {
  /**
   * Current manually selected language
   */
  selectedLanguage: SupportedLanguage | null;

  /**
   * Whether a language has been manually selected
   */
  isManuallySet: boolean;

  /**
   * Set a language manually
   */
  setLanguageManually: (language: SupportedLanguage) => void;

  /**
   * Set a language automatically (e.g., from detection)
   */
  setLanguageAutomatically: (language: SupportedLanguage) => void;

  /**
   * Reset manual selection (e.g., when editor is cleared)
   */
  resetManualSelection: () => void;
}

/**
 * Hook to manage manual vs automatic language selection
 * Ensures that manual selection takes precedence over auto-detection
 */
export function useManualLanguageSelection(): UseManualLanguageSelectionReturn {
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguage | null>(null);
  const [isManuallySet, setIsManuallySet] = useState(false);

  const setLanguageManually = useCallback((language: SupportedLanguage) => {
    setSelectedLanguage(language);
    setIsManuallySet(true);
  }, []);

  const setLanguageAutomatically = useCallback(
    (language: SupportedLanguage) => {
      // Only set if no manual selection has been made
      if (!isManuallySet) {
        setSelectedLanguage(language);
      }
    },
    [isManuallySet],
  );

  const resetManualSelection = useCallback(() => {
    setSelectedLanguage(null);
    setIsManuallySet(false);
  }, []);

  return {
    selectedLanguage,
    isManuallySet,
    setLanguageManually,
    setLanguageAutomatically,
    resetManualSelection,
  };
}
