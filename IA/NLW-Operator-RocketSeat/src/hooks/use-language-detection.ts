"use client";

import { useCallback, useRef, useState } from "react";
import {
  detectLanguage,
  detectLanguageHeuristic,
} from "@/components/ui/code-editor/language-detector";
import type { SupportedLanguage } from "@/lib/syntax-highlighting";

interface UseLanguageDetectionOptions {
  /**
   * Minimum confidence threshold (0-1)
   * If ML detection confidence is below this, fallback to heuristic
   */
  minConfidence?: number;

  /**
   * Enable heuristic fallback when ML detection fails
   */
  enableHeuristicFallback?: boolean;

  /**
   * Debounce delay in milliseconds
   */
  debounceMs?: number;
}

interface UseLanguageDetectionReturn {
  /**
   * Detect language for the given code
   */
  detect: (code: string) => Promise<{
    language: SupportedLanguage | null;
    confidence: number;
    method: "ml" | "heuristic" | "failed";
  }>;

  /**
   * Current detection state
   */
  isDetecting: boolean;

  /**
   * Last detection error
   */
  error: string | null;
}

/**
 * Hook for automatic language detection
 * Uses VS Code's ML model with heuristic fallback
 */
export function useLanguageDetection(
  options: UseLanguageDetectionOptions = {},
): UseLanguageDetectionReturn {
  const {
    minConfidence = 0.6, // Increased default minimum confidence
    enableHeuristicFallback = true,
    debounceMs = 500,
  } = options;

  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const detect = useCallback(
    async (code: string) => {
      // Clear previous detection
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Abort previous detection if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setError(null);

      // Create new abort controller for this detection
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      return new Promise<{
        language: SupportedLanguage | null;
        confidence: number;
        method: "ml" | "heuristic" | "failed";
      }>((resolve) => {
        debounceRef.current = setTimeout(async () => {
          if (signal.aborted) {
            resolve({ language: null, confidence: 0, method: "failed" });
            return;
          }

          setIsDetecting(true);

          try {
            // Try ML detection first
            const mlResult = await detectLanguage(code);

            if (signal.aborted) {
              resolve({ language: null, confidence: 0, method: "failed" });
              return;
            }

            // Check if ML detection was successful and confident enough
            if (mlResult && mlResult.confidence >= minConfidence) {
              resolve({
                language: mlResult.language,
                confidence: mlResult.confidence,
                method: "ml",
              });
              return;
            }

            // Try heuristic fallback if enabled
            if (enableHeuristicFallback) {
              const heuristicResult = detectLanguageHeuristic(code);

              if (signal.aborted) {
                resolve({ language: null, confidence: 0, method: "failed" });
                return;
              }

              if (heuristicResult) {
                resolve({
                  language: heuristicResult,
                  confidence: 0.7, // Assign moderate confidence to heuristic detection
                  method: "heuristic",
                });
                return;
              }
            }

            // No detection method worked
            resolve({ language: null, confidence: 0, method: "failed" });
          } catch (err) {
            if (!signal.aborted) {
              const errorMessage =
                err instanceof Error ? err.message : "Detection failed";
              setError(errorMessage);
              console.warn("Language detection error:", err);

              // Try heuristic as final fallback
              if (enableHeuristicFallback) {
                try {
                  const heuristicResult = detectLanguageHeuristic(code);
                  if (heuristicResult) {
                    resolve({
                      language: heuristicResult,
                      confidence: 0.6, // Lower confidence due to error fallback
                      method: "heuristic",
                    });
                    return;
                  }
                } catch (heuristicError) {
                  console.warn(
                    "Heuristic detection also failed:",
                    heuristicError,
                  );
                }
              }

              resolve({ language: null, confidence: 0, method: "failed" });
            }
          } finally {
            if (!signal.aborted) {
              setIsDetecting(false);
            }
          }
        }, debounceMs);
      });
    },
    [minConfidence, enableHeuristicFallback, debounceMs],
  );

  return {
    detect,
    isDetecting,
    error,
  };
}
