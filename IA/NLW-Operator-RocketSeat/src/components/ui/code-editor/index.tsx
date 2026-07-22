"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useLanguageDetection } from "@/hooks/use-language-detection";
import { useSyntaxHighlighter } from "@/hooks/use-syntax-highlighter";
import type { SupportedLanguage } from "@/lib/syntax-highlighting";
import { LanguageSelector } from "./language-selector";

const codeEditorVariants = tv({
  slots: {
    container: [
      "relative",
      "bg-devroast-surface",
      "border",
      "border-devroast-border",
      "font-mono",
      "overflow-hidden",
      "w-full",
      "lg:w-140", // 560px como no Pencil design
    ],
    header: [
      "flex",
      "items-center",
      "justify-between",
      "h-13", // 40px como no Pencil
      "px-4",
      "border-b",
      "border-devroast-border",
      "bg-transparent",
    ],
    trafficLights: ["flex", "items-center", "gap-2"],
    trafficDot: ["w-3", "h-3", "rounded-full"],
    languageControls: ["flex", "items-center", "gap-2"],
    contentWrapper: [
      "flex",
      "relative", // Para posicionamento do textarea overlay
    ],
    lineNumbers: [
      "w-10", // 40px como no Pencil
      "bg-devroast-surface",
      "border-r",
      "border-devroast-border",
      "flex",
      "flex-col",
      "items-end",
      "py-3", // 12px padding
      "px-2.5", // 10px padding
      "text-[13px]", // 13px como no Pencil
      "leading-[19px]", // 6px gap = 13px + 6px = 19px line-height
      "text-devroast-text-muted",
      "font-mono",
      "select-none",
      "overflow-hidden",
      "hidden",
      "sm:flex",
    ],
    codeArea: ["flex-1", "relative", "font-mono", "text-xs", "leading-5"],
    syntaxBackground: [
      "absolute",
      "top-0",
      "left-0",
      "w-full",
      "h-full",
      "p-3", // 12px padding como no Pencil
      "text-[13px]", // 13px font size
      "leading-[19px]", // 6px gap = line-height
      "font-mono",
      "pointer-events-none",
      "select-none",
      "whitespace-pre",
      "overflow-hidden",
      "bg-devroast-surface",
    ],
    textareaOverlay: [
      "absolute",
      "top-0",
      "left-0",
      "w-full",
      "h-full",
      "p-3", // 12px padding
      "text-[13px]", // 13px font size
      "leading-[19px]",
      "font-mono",
      "bg-transparent",
      "border-none",
      "outline-none",
      "resize-none",
      "text-transparent", // Texto invisível, mostra syntax background
      "placeholder:text-devroast-text-muted",
      "placeholder:opacity-100",
      "caret-white", // Cursor branco visível
      "z-10",
    ],
    characterCounter: [
      "absolute",
      "bottom-2",
      "right-3",
      "font-mono",
      "text-xs",
      "text-devroast-text-muted",
      "pointer-events-none",
      "z-20", // Above textarea
      "bg-devroast-surface",
      "px-2",
      "py-1",
      "border",
      "border-devroast-border",
    ],
    loadingIndicator: [
      "absolute",
      "top-2",
      "right-2",
      "w-4",
      "h-4",
      "border-2",
      "border-devroast-green",
      "border-t-transparent",
      "rounded-full",
      "animate-spin",
      "z-20",
    ],
  },
  variants: {
    height: {
      adaptive: {
        container: [
          "min-h-90", // 360px mínimo
          "max-h-[600px]", // 600px máximo
        ],
        contentWrapper: [
          "min-h-80", // 320px conteúdo
          "max-h-[560px]",
          "relative",
        ],
        lineNumbers: ["min-h-80", "max-h-[560px]", "overflow-hidden"],
        syntaxBackground: ["overflow-hidden", "h-full"],
        textareaOverlay: ["overflow-auto", "devroast-scrollbar", "h-full"],
      },
      fixed: {
        container: "h-90",
        contentWrapper: ["h-80", "relative"],
        lineNumbers: ["h-80", "overflow-hidden"],
        syntaxBackground: ["overflow-hidden", "h-full"],
        textareaOverlay: ["overflow-auto", "devroast-scrollbar", "h-full"],
      },
      auto: {
        container: "min-h-48",
        contentWrapper: "min-h-32",
        lineNumbers: "min-h-32",
      },
    },
    responsive: {
      true: {
        container: [
          "w-full",
          "lg:w-195", // 780px no desktop
        ],
        lineNumbers: ["hidden", "sm:flex", "sm:w-12"],
      },
      false: {
        container: "w-195",
        lineNumbers: "w-12",
      },
    },
  },
  defaultVariants: {
    height: "adaptive",
    responsive: true,
  },
});

export interface CodeEditorProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange">,
    VariantProps<typeof codeEditorVariants> {
  /**
   * Current code value
   */
  value: string;

  /**
   * Callback when code changes
   */
  onChange: (value: string) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Manual language override
   */
  language?: SupportedLanguage;

  /**
   * Enable automatic language detection
   */
  autoDetectLanguage?: boolean;

  /**
   * Show language selector dropdown
   */
  showLanguageSelector?: boolean;

  /**
   * Show line numbers
   */
  showLineNumbers?: boolean;

  /**
   * Show header with traffic lights and language selector
   */
  showHeader?: boolean;

  /**
   * Enable syntax highlighting
   */
  enableSyntaxHighlighting?: boolean;

  /**
   * Callback when language is detected or changed
   */
  onLanguageChange?: (language: SupportedLanguage, confidence?: number) => void;

  /**
   * Maximum character length
   */
  maxLength?: number;

  /**
   * Show character counter
   */
  showCharacterCount?: boolean;

  /**
   * Callback when character limit is exceeded
   */
  onLimitExceeded?: (exceeded: boolean) => void;
}

/**
 * Advanced code editor with syntax highlighting and language detection
 * Evolution of EditableCodeInput with new capabilities while maintaining backward compatibility
 */
const CodeEditor = forwardRef<HTMLTextAreaElement, CodeEditorProps>(
  (
    {
      className,
      value,
      onChange,
      placeholder = "// Digite seu código aqui...",
      language,
      autoDetectLanguage = true,
      showLanguageSelector = true,
      showLineNumbers = true,
      showHeader = true,
      enableSyntaxHighlighting = true,
      maxLength = 2000,
      showCharacterCount = true,
      onLimitExceeded,
      onLanguageChange,
      height,
      responsive,
      ...props
    },
    ref,
  ) => {
    const {
      container,
      header,
      trafficLights,
      trafficDot,
      languageControls,
      contentWrapper,
      lineNumbers,
      codeArea,
      syntaxBackground,
      textareaOverlay,
      characterCounter,
      loadingIndicator,
    } = codeEditorVariants({ height, responsive });

    // State management
    const [detectedLanguage, setDetectedLanguage] =
      useState<SupportedLanguage | null>(null);
    const [detectionConfidence, setDetectionConfidence] = useState<number>(0);
    const [highlightedCode, setHighlightedCode] = useState("");
    const [isManuallySet, setIsManuallySet] = useState(false); // Track if user manually selected language
    const [lastCodeLength, setLastCodeLength] = useState(value.length); // Track code changes

    // Refs
    const syntaxRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);

    // Hooks
    const { highlightCode, isLoading: isHighlighting } = useSyntaxHighlighter({
      language: language || detectedLanguage || "javascript",
      lazy: true,
    });

    const { detect, isDetecting } = useLanguageDetection({
      minConfidence: 0.6, // Higher confidence threshold
      enableHeuristicFallback: true,
      debounceMs: 500,
    });

    // Current effective language
    const currentLanguage = useMemo(() => {
      return language || detectedLanguage || "javascript";
    }, [language, detectedLanguage]);

    // Character count and limit tracking
    const characterCount = value.length;
    const isOverLimit = characterCount > maxLength;

    // Combine refs
    const combinedRef = useCallback(
      (node: HTMLTextAreaElement) => {
        textareaRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    // Auto-detect language on code change - only if not manually set and code actually changed
    useEffect(() => {
      const currentCodeLength = value.length;
      const codeChanged = Math.abs(currentCodeLength - lastCodeLength) > 5; // Significant change threshold

      // Only auto-detect if:
      // 1. Auto-detection is enabled
      // 2. No manual language override from prop
      // 3. User hasn't manually selected a language
      // 4. Code has changed significantly
      // 5. Code is long enough to analyze
      if (
        autoDetectLanguage &&
        !language &&
        !isManuallySet &&
        codeChanged &&
        value.trim().length > 10
      ) {
        detect(value)
          .then((result) => {
            if (result.language && result.confidence > 0.5) {
              setDetectedLanguage(result.language);
              setDetectionConfidence(result.confidence);

              if (onLanguageChange) {
                onLanguageChange(result.language, result.confidence);
              }
            }
          })
          .catch(() => {
            // Detection failed, use fallback
            setDetectedLanguage("javascript");
            setDetectionConfidence(0.3);
          });
      }

      // Update last code length
      setLastCodeLength(currentCodeLength);
    }, [
      value,
      autoDetectLanguage,
      language,
      detect,
      onLanguageChange,
      isManuallySet,
      lastCodeLength,
    ]);

    // Reset manual selection when code is cleared or becomes very short
    useEffect(() => {
      if (value.trim().length < 10) {
        setIsManuallySet(false);
        setDetectedLanguage(null);
        setDetectionConfidence(0);
      }
    }, [value]);

    // Notify parent when limit is exceeded
    useEffect(() => {
      if (onLimitExceeded) {
        onLimitExceeded(isOverLimit);
      }
    }, [isOverLimit, onLimitExceeded]);

    useEffect(() => {
      if (enableSyntaxHighlighting && value) {
        highlightCode(value, currentLanguage)
          .then((highlighted) => {
            // Extract just the inner content from the <pre><code> wrapper
            const match = highlighted.match(/<code[^>]*>([\s\S]*?)<\/code>/);
            if (match) {
              setHighlightedCode(match[1]);
            } else {
              setHighlightedCode(highlighted);
            }
          })
          .catch(() => {
            // Fallback to plain text if highlighting fails
            setHighlightedCode(escapeHtml(value));
          });
      } else {
        setHighlightedCode(escapeHtml(value));
      }
    }, [value, currentLanguage, enableSyntaxHighlighting, highlightCode]);

    // Handle language change from selector
    const handleLanguageChange = useCallback(
      (newLanguage: SupportedLanguage) => {
        setDetectedLanguage(newLanguage);
        setDetectionConfidence(1.0); // Manual selection = 100% confidence
        setIsManuallySet(true); // Mark as manually set to prevent auto-detection

        if (onLanguageChange) {
          onLanguageChange(newLanguage, 1.0);
        }
      },
      [onLanguageChange],
    );

    // Handle paste for auto-detection - only if not manually set
    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        // Call original paste handler first
        if (props.onPaste) {
          props.onPaste(e);
        }

        // Only proceed with auto-detection if conditions are met
        if (!autoDetectLanguage || language || isManuallySet) {
          return;
        }

        try {
          // Use the clipboard data directly for immediate detection
          const pastedData = e.clipboardData?.getData("text") || "";
          if (pastedData.trim().length > 10) {
            // Combine current value with pasted data for detection
            const newValue = value + pastedData;

            detect(newValue)
              .then((result) => {
                if (result.language) {
                  setDetectedLanguage(result.language);
                  setDetectionConfidence(result.confidence);

                  if (onLanguageChange) {
                    onLanguageChange(result.language, result.confidence);
                  }
                }
              })
              .catch((error) => {
                // Log error in development but don't crash
                if (process.env.NODE_ENV === "development") {
                  console.warn("Language detection failed on paste:", error);
                }
              });
          }
        } catch (error) {
          // Prevent paste detection errors from breaking the paste functionality
          if (process.env.NODE_ENV === "development") {
            console.warn("Error in paste detection handler:", error);
          }
        }
      },
      [
        autoDetectLanguage,
        language,
        detect,
        onLanguageChange,
        isManuallySet,
        value,
        props.onPaste,
      ],
    );

    // Sync scroll between textarea and other elements
    const handleScroll = useCallback(() => {
      if (textareaRef.current && syntaxRef.current && lineNumbersRef.current) {
        const scrollTop = textareaRef.current.scrollTop;
        const scrollLeft = textareaRef.current.scrollLeft;

        syntaxRef.current.scrollTop = scrollTop;
        syntaxRef.current.scrollLeft = scrollLeft;
        lineNumbersRef.current.scrollTop = scrollTop;
      }
    }, []);

    // Handle Tab key for indentation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const textarea = e.currentTarget;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newValue = `${value.substring(0, start)}  ${value.substring(end)}`;

          onChange(newValue);

          // Set cursor position after the inserted spaces
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
          }, 0);
        }

        if (props.onKeyDown) {
          props.onKeyDown(e);
        }
      },
      [value, onChange, props.onKeyDown],
    );

    // Generate line numbers
    const lines = value.split("\n");
    const lineNumbersArray = lines.map((_, index) => index + 1);

    return (
      <div className={container({ className })}>
        {showHeader && (
          <div className={header()}>
            {/* Traffic lights */}
            <div className={trafficLights()}>
              <div
                className={trafficDot()}
                style={{ backgroundColor: "#EF4444" }}
              />
              <div
                className={trafficDot()}
                style={{ backgroundColor: "#F59E0B" }}
              />
              <div
                className={trafficDot()}
                style={{ backgroundColor: "#10B981" }}
              />
            </div>

            {/* Language controls */}
            {showLanguageSelector && (
              <div className={languageControls()}>
                <LanguageSelector
                  value={currentLanguage}
                  onValueChange={handleLanguageChange}
                  confidence={detectionConfidence}
                  isManual={isManuallySet}
                  className="w-40"
                />
              </div>
            )}
          </div>
        )}

        <div className={contentWrapper()}>
          {/* Loading indicators */}
          {(isDetecting || isHighlighting) && (
            <div className={loadingIndicator()} />
          )}

          {/* Line numbers */}
          {showLineNumbers && (
            <div ref={lineNumbersRef} className={lineNumbers()}>
              {lineNumbersArray.map((lineNumber) => (
                <div key={lineNumber}>{lineNumber}</div>
              ))}
            </div>
          )}

          <div className={codeArea()}>
            {/* Syntax highlighted background */}
            <div
              ref={syntaxRef}
              className={syntaxBackground()}
              style={{ color: "var(--color-syn-operator)" }}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />

            {/* Transparent textarea overlay */}
            <textarea
              ref={combinedRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={placeholder}
              className={textareaOverlay()}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              {...props}
            />

            {/* Character Counter */}
            {showCharacterCount && (
              <div
                className={characterCounter()}
                style={{
                  color: isOverLimit
                    ? "var(--color-devroast-red)"
                    : "var(--color-devroast-text-muted)",
                }}
              >
                {characterCount.toLocaleString()}/{maxLength.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

// Utility for HTML escaping
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

CodeEditor.displayName = "CodeEditor";

export { CodeEditor, codeEditorVariants };
