"use client";

import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const editableCodeInputVariants = tv({
  slots: {
    container: [
      "relative",
      "bg-devroast-surface", // Fundo escuro correto do Pencil ($bg-input)
      "border",
      "border-devroast-border",
      "font-mono",
      "overflow-hidden",
      // Mobile-first responsive
      "w-full",
      "lg:w-140", // 560px como no Pencil design
    ],
    header: [
      "flex",
      "items-center",
      "justify-start",
      "h-10", // 40px como no Pencil
      "px-4",
      "border-b",
      "border-devroast-border",
      "bg-transparent",
    ],
    trafficLights: ["flex", "items-center", "gap-2"],
    trafficDot: ["w-3", "h-3", "rounded-full"],
    contentWrapper: [
      "flex",
      "relative", // Para posicionamento do textarea overlay e character counter
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
      "overflow-hidden", // Scroll sincronizado externamente
      // Mobile: linha numbers opcionais
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
      "pointer-events-none", // Permite cliques através da textarea
      "select-none",
      "whitespace-pre",
      "overflow-hidden",
      "bg-devroast-surface", // Fundo escuro correto
    ],
    textareaOverlay: [
      "absolute",
      "top-0",
      "left-0",
      "w-full",
      "h-full",
      "p-3", // 12px padding
      "text-[13px]", // 13px font size
      "leading-[19px]", // Matching line height
      "font-mono",
      "bg-transparent",
      "border-none",
      "outline-none",
      "resize-none",
      "text-transparent", // Texto invisível, mostra syntax background
      "caret-white", // Cursor branco visível
      "z-10", // Above syntax background
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
  },
  variants: {
    height: {
      adaptive: {
        container: [
          "min-h-90", // 360px mínimo (altura do Pencil design)
          "max-h-[600px]", // 600px máximo antes de scroll
        ],
        contentWrapper: [
          "min-h-80", // 320px conteúdo (360 - 40 header)
          "max-h-[560px]", // 560px conteúdo (600 - 40 header)
          "relative", // Para posicionamento dos elementos internos
        ],
        lineNumbers: [
          "min-h-80",
          "max-h-[560px]",
          "overflow-hidden", // Scroll controlado pelo textarea
        ],
        syntaxBackground: ["overflow-hidden", "h-full"],
        textareaOverlay: [
          "overflow-auto", // O scroll acontece aqui
          "devroast-scrollbar", // Scrollbar customizada na textarea
          "h-full",
        ],
      },
      fixed: {
        container: "h-90", // 360px fixo como Pencil
        contentWrapper: [
          "h-80", // 320px (360 - 40 header)
          "relative", // Para posicionamento
        ],
        lineNumbers: ["h-80", "overflow-hidden"],
        syntaxBackground: ["overflow-hidden", "h-full"],
        textareaOverlay: [
          "overflow-auto", // O scroll acontece aqui
          "devroast-scrollbar", // Scrollbar customizada na textarea
          "h-full",
        ],
      },
      auto: {
        container: "min-h-48", // Mínimo para UX
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
        lineNumbers: [
          "hidden",
          "sm:flex", // Visível apenas tablet+
          "sm:w-12",
        ],
      },
      false: {
        container: "w-195", // Largura fixa
        lineNumbers: "w-12", // Sempre visível
      },
    },
  },
  defaultVariants: {
    height: "adaptive",
    responsive: true,
  },
});

export interface EditableCodeInputProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange">,
    VariantProps<typeof editableCodeInputVariants> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: "typescript" | "javascript";
  showLineNumbers?: boolean;
  showHeader?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
  onLimitExceeded?: (exceeded: boolean) => void;
}

// TypeScript/JavaScript syntax highlighter otimizado
const highlightTypescriptSyntax = (code: string): string => {
  const keywords = new Set([
    "function",
    "var",
    "let",
    "const",
    "if",
    "else",
    "for",
    "while",
    "do",
    "return",
    "true",
    "false",
    "null",
    "undefined",
    "class",
    "interface",
    "type",
    "enum",
    "import",
    "export",
    "default",
    "new",
    "this",
    "super",
    "extends",
    "implements",
    "public",
    "private",
    "protected",
    "static",
    "readonly",
    "async",
    "await",
    "try",
    "catch",
    "finally",
    "throw",
    "typeof",
    "instanceof",
    "in",
    "of",
    "as",
    "is",
    "namespace",
  ]);

  const types = new Set([
    "string",
    "number",
    "boolean",
    "object",
    "any",
    "void",
    "never",
    "unknown",
    "Array",
    "Promise",
    "Date",
    "RegExp",
    "Error",
  ]);

  let result = "";
  let i = 0;

  while (i < code.length) {
    const char = code[i];

    // Comentários de linha
    if (char === "/" && code[i + 1] === "/") {
      const start = i;
      while (i < code.length && code[i] !== "\n") i++;
      const comment = code.slice(start, i);
      result += `<span style="color: var(--color-syn-comment)">${escapeHtml(comment)}</span>`;
      continue;
    }

    // Comentários de bloco
    if (char === "/" && code[i + 1] === "*") {
      const start = i;
      i += 2;
      while (i < code.length - 1 && !(code[i] === "*" && code[i + 1] === "/"))
        i++;
      if (i < code.length - 1) i += 2; // Include */
      const comment = code.slice(start, i);
      result += `<span style="color: var(--color-syn-comment)">${escapeHtml(comment)}</span>`;
      continue;
    }

    // Strings
    if (char === '"' || char === "'" || char === "`") {
      const quote = char;
      const start = i;
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === "\\") i++; // Escape sequence
        i++;
      }
      if (i < code.length) i++; // Include closing quote
      const str = code.slice(start, i);
      result += `<span style="color: var(--color-syn-string)">${escapeHtml(str)}</span>`;
      continue;
    }

    // Números
    if (/\d/.test(char)) {
      const start = i;
      while (i < code.length && /[\d.]/.test(code[i])) i++;
      const num = code.slice(start, i);
      result += `<span style="color: var(--color-syn-number)">${escapeHtml(num)}</span>`;
      continue;
    }

    // Identificadores (palavras-chave, funções, variáveis)
    if (/[a-zA-Z_$]/.test(char)) {
      const start = i;
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) i++;
      const identifier = code.slice(start, i);

      // Skip whitespace to check context
      let j = i;
      while (j < code.length && /\s/.test(code[j])) j++;

      // Check if it's a function call
      const isFunction =
        code[j] === "(" ||
        (identifier === "function" && /\s/.test(code[i] || " "));

      // Check if it's a property access
      let k = start - 1;
      while (k >= 0 && /\s/.test(code[k])) k--;
      const isProperty = code[k] === ".";

      // Check if it's a type annotation
      const beforeColon = code.slice(0, start).lastIndexOf(":");
      const isType =
        beforeColon > -1 &&
        code.slice(beforeColon + 1, start).trim() === "" &&
        types.has(identifier);

      let className = "";
      if (keywords.has(identifier)) {
        className = "var(--color-syn-keyword)";
      } else if (isType || types.has(identifier)) {
        className = "var(--color-syn-type)";
      } else if (isFunction && !keywords.has(identifier)) {
        className = "var(--color-syn-function)";
      } else if (isProperty) {
        className = "var(--color-syn-property)";
      } else {
        className = "var(--color-syn-variable)";
      }

      result += `<span style="color: ${className}">${escapeHtml(identifier)}</span>`;
      continue;
    }

    // Operadores e pontuação
    result += `<span style="color: var(--color-syn-operator)">${escapeHtml(char)}</span>`;
    i++;
  }

  return result;
};

// Utility para escape HTML
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const EditableCodeInput = forwardRef<
  HTMLTextAreaElement,
  EditableCodeInputProps
>(
  (
    {
      className,
      value,
      onChange,
      placeholder = "// Digite seu código TypeScript aqui...",
      language = "typescript",
      showLineNumbers = true,
      showHeader = true,
      maxLength = 5000,
      showCharacterCount = true,
      onLimitExceeded,
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
      contentWrapper,
      lineNumbers,
      codeArea,
      syntaxBackground,
      textareaOverlay,
      characterCounter,
    } = editableCodeInputVariants({ height, responsive });

    const [highlightedCode, setHighlightedCode] = useState("");
    const syntaxRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);

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

    // Update syntax highlighting
    useEffect(() => {
      const highlighted = highlightTypescriptSyntax(value);
      setHighlightedCode(highlighted);
    }, [value]);

    // Notify parent when limit is exceeded
    useEffect(() => {
      if (onLimitExceeded) {
        onLimitExceeded(isOverLimit);
      }
    }, [isOverLimit, onLimitExceeded]);

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
          </div>
        )}

        <div className={contentWrapper()}>
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

EditableCodeInput.displayName = "EditableCodeInput";

export { EditableCodeInput, editableCodeInputVariants };
