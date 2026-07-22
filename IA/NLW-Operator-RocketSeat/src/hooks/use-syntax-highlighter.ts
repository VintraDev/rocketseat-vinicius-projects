"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki";
import {
  devRoastTheme,
  type SupportedLanguage,
} from "@/lib/syntax-highlighting";

interface UseSyntaxHighlighterOptions {
  language?: SupportedLanguage;
  lazy?: boolean;
}

type SyntaxHighlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

interface UseSyntaxHighlighterReturn {
  highlighter: SyntaxHighlighter | null;
  isLoading: boolean;
  error: string | null;
  highlightCode: (
    code: string,
    language?: SupportedLanguage,
  ) => Promise<string>;
}

let highlighterInstance: SyntaxHighlighter | null = null;
let highlighterPromise: Promise<SyntaxHighlighter> | null = null;

/**
 * Hook for syntax highlighting with Shiki v4
 * Provides lazy loading and caching of the highlighter instance
 */
export function useSyntaxHighlighter(
  options: UseSyntaxHighlighterOptions = {},
): UseSyntaxHighlighterReturn {
  const { language, lazy = true } = options;

  const [highlighter, setHighlighter] = useState<SyntaxHighlighter | null>(
    highlighterInstance,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  /**
   * Load Shiki v4 highlighter with DevRoast theme
   */
  const loadHighlighter = useCallback(async () => {
    if (highlighterInstance) {
      return highlighterInstance;
    }

    if (highlighterPromise) {
      return highlighterPromise;
    }

    setIsLoading(true);
    setError(null);

    highlighterPromise = (async () => {
      try {
        // Dynamic import to reduce initial bundle size - Shiki v4 API
        const { createHighlighter } = await import("shiki");

        // Import the most common languages first - Shiki v4 API
        const { bundledLanguages: langs } = await import("shiki");

        const highlighter = await createHighlighter({
          themes: [devRoastTheme],
          langs: [
            langs.javascript,
            langs.typescript,
            langs.python,
            langs.html,
            langs.css,
            langs.json,
          ],
        });

        highlighterInstance = highlighter;
        return highlighter;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load highlighter";
        console.error("Failed to load Shiki highlighter:", err);

        if (mountedRef.current) {
          setError(errorMessage);
        }

        highlighterPromise = null;
        throw err;
      }
    })();

    try {
      const result = await highlighterPromise;

      if (mountedRef.current) {
        setHighlighter(result);
        setIsLoading(false);
      }

      return result;
    } catch (err) {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      throw err;
    }
  }, []);

  /**
   * Highlight code with specified language
   */
  const highlightCode = useCallback(
    async (
      code: string,
      targetLanguage?: SupportedLanguage,
    ): Promise<string> => {
      try {
        const currentLanguage = targetLanguage || language || "javascript";
        const highlighter = await loadHighlighter();

        // Check if we need to load additional languages - Shiki v4 API
        const loadedLanguages = highlighter.getLoadedLanguages();
        if (!loadedLanguages.includes(currentLanguage)) {
          try {
            // Dynamically load the language if needed - Shiki v4 format
            const { bundledLanguages } = await import("shiki");
            const langDefinition =
              bundledLanguages[
                currentLanguage as keyof typeof bundledLanguages
              ];

            if (langDefinition) {
              await highlighter.loadLanguage(langDefinition);
            } else {
              console.warn(
                `Language ${currentLanguage} not found in bundled languages`,
              );
            }
          } catch (langError) {
            console.warn(
              `Failed to load language ${currentLanguage}, falling back to javascript`,
              langError,
            );
            // Fallback to javascript if language loading fails
          }
        }

        const highlighted = highlighter.codeToHtml(code, {
          lang: loadedLanguages.includes(currentLanguage)
            ? currentLanguage
            : "javascript",
          theme: "devroast-dark",
        });

        return highlighted;
      } catch (err) {
        console.error("Failed to highlight code:", err);
        // Return code wrapped in a basic pre tag as fallback
        return `<pre class="text-devroast-text-primary"><code>${escapeHtml(code)}</code></pre>`;
      }
    },
    [language, loadHighlighter],
  );

  // Auto-load highlighter if not lazy
  useEffect(() => {
    if (!lazy && !highlighter && !isLoading) {
      loadHighlighter().catch(() => {
        // Error already handled in loadHighlighter
      });
    }
  }, [lazy, highlighter, isLoading, loadHighlighter]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    highlighter,
    isLoading,
    error,
    highlightCode,
  };
}

/**
 * Utility to escape HTML in fallback scenarios
 */
function escapeHtml(text: string): string {
  if (typeof document === "undefined") {
    // Server-side fallback
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
