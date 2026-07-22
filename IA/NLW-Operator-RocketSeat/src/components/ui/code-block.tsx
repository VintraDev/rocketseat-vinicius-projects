import { forwardRef } from "react";
import {
  type BundledLanguage,
  type BundledTheme,
  codeToHtml,
  type ThemeRegistration,
} from "shiki";
import { tv, type VariantProps } from "tailwind-variants";

const devroastTheme: ThemeRegistration = {
  name: "devroast",
  type: "dark",
  colors: {
    "editor.background": "#0f0f0f",
    "editor.foreground": "#abb2bf",
  },
  tokenColors: [
    {
      name: "Keywords",
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator.new",
        "keyword.operator.expression",
        "keyword.other.substitution",
        "storage.type",
        "storage.modifier",
      ],
      settings: { foreground: "#c678dd" },
    },
    {
      name: "Functions",
      scope: [
        "entity.name.function",
        "support.function",
        "meta.function-call",
        "variable.function",
        "entity.name.method",
        "support.method",
      ],
      settings: { foreground: "#61afef" },
    },
    {
      name: "Variables",
      scope: [
        "variable",
        "variable.other",
        "variable.parameter",
        "meta.definition.variable.name",
        "variable.language.this",
      ],
      settings: { foreground: "#e06c75" },
    },
    {
      name: "Numbers",
      scope: ["constant.numeric", "constant.language.boolean"],
      settings: { foreground: "#d19a66" },
    },
    {
      name: "Strings",
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "constant.other.symbol",
      ],
      settings: { foreground: "#e5c07b" },
    },
    {
      name: "Properties",
      scope: [
        "variable.other.property",
        "support.variable.property",
        "meta.object-literal.key",
        "entity.name.tag",
        "variable.other.object.property",
        "support.type.property-name",
      ],
      settings: { foreground: "#98c379" },
    },
    {
      name: "Operators and punctuation",
      scope: [
        "punctuation",
        "keyword.operator",
        "punctuation.definition",
        "punctuation.separator",
        "punctuation.terminator",
        "meta.brace",
        "punctuation.section",
      ],
      settings: { foreground: "#abb2bf" },
    },
    {
      name: "Comments",
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: "#8b8b8b", fontStyle: "italic" },
    },
  ],
};

const codeBlockVariants = tv({
  slots: {
    container: [
      "relative",
      "bg-devroast-surface",
      "border",
      "border-devroast-border",
      "font-mono",
      "overflow-hidden",
      // ✅ Sem altura fixa — o container cresce com o conteúdo
    ],
    header: [
      "flex",
      "items-center",
      "justify-start",
      "h-10",
      "px-4",
      "border-b",
      "border-devroast-border",
      "bg-transparent",
    ],
    trafficLights: ["flex", "items-center", "gap-2"],
    trafficDot: ["w-3", "h-3", "rounded-full"],
    contentWrapper: ["flex"],
    lineNumbers: [
      "w-12",
      "bg-devroast-surface",
      "border-r",
      "border-devroast-border",
      "flex",
      "flex-col",
      "items-end",
      "py-4",
      "px-3",
      "text-xs",
      "leading-5",
      "text-devroast-text-muted",
      "font-mono",
      "select-none",
    ],
    content: [
      "flex-1",
      "overflow-auto",
      "p-4",
      "[&_pre]:m-0",
      "[&_pre]:bg-transparent",
      "[&_pre]:text-xs",
      "[&_pre]:leading-5",
      "[&_pre]:font-mono",
      "[&_code]:font-mono",
    ],
    filename: ["text-xs", "font-mono", "text-devroast-text-muted", "ml-3"],
  },
  variants: {
    variant: {
      default: {},
      withFilename: {
        header: "justify-start",
      },
      minimal: {
        container: "border-0 bg-transparent",
        header: "hidden",
        lineNumbers: "hidden",
      },
    },
    size: {
      // ✅ Apenas tipografia e espaçamento — sem altura fixa
      sm: {
        lineNumbers: "w-10 px-2.5 py-3.5 text-xs",
        content: "p-3.5 [&_pre]:text-xs",
        trafficDot: "w-2.5 h-2.5",
      },
      md: {
        lineNumbers: "w-12 px-3 py-4",
        content: "p-4 [&_pre]:text-xs",
      },
      lg: {
        lineNumbers: "w-12 px-3 py-4",
        content: "p-6 [&_pre]:text-sm",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface CodeBlockProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof codeBlockVariants> {
  code: string;
  language?: BundledLanguage;
  theme?: BundledTheme;
  showHeader?: boolean;
  showLineNumbers?: boolean;
  filename?: string;
}

const CodeBlock = async ({
  className,
  code,
  language = "javascript",
  theme = "vesper",
  showHeader = true,
  showLineNumbers = true,
  filename,
  variant = filename ? "withFilename" : "default",
  size,
  ...props
}: CodeBlockProps) => {
  const {
    container,
    header,
    trafficLights,
    trafficDot,
    contentWrapper,
    lineNumbers,
    content,
    filename: filenameClass,
  } = codeBlockVariants({ variant, size });

  const lines = code.split("\n");
  const lineNumbersArray = lines.map((_, index) => index + 1);

  const html = await codeToHtml(code, {
    lang: language,
    theme: devroastTheme,
    transformers: [
      {
        pre(node) {
          node.properties.style = ((node.properties.style as string) || "")
            .replace(/background-color:[^;]+;?/, "")
            .replace(/background:[^;]+;?/, "");
        },
      },
    ],
  });

  return (
    <div className={container({ className })} {...props}>
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
          {filename && <span className={filenameClass()}>{filename}</span>}
        </div>
      )}
      <div className={contentWrapper()}>
        {showLineNumbers && (
          <div className={lineNumbers()}>
            {lineNumbersArray.map((lineNumber) => (
              <div key={lineNumber}>{lineNumber}</div>
            ))}
          </div>
        )}
        <div className={content()}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
};

// Client version
const CodeBlockWithCopy = forwardRef<
  HTMLDivElement,
  Omit<CodeBlockProps, "code"> & { children: string }
>(
  (
    {
      children,
      className,
      filename,
      variant = filename ? "withFilename" : "default",
      size,
      showHeader = true,
      showLineNumbers = true,
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
      content,
      filename: filenameClass,
    } = codeBlockVariants({ variant, size });

    const lines = children.split("\n");
    const lineNumbersArray = lines.map((_, index) => index + 1);

    const highlightSyntax = (code: string) => {
      const keywords = new Set([
        "function",
        "var",
        "let",
        "const",
        "if",
        "else",
        "for",
        "while",
        "return",
        "true",
        "false",
        "null",
        "undefined",
        "class",
        "new",
      ]);

      const tokens: { type: string; value: string }[] = [];
      let i = 0;

      while (i < code.length) {
        const char = code[i];

        if (char === "/" && code[i + 1] === "/") {
          const start = i;
          while (i < code.length && code[i] !== "\n") i++;
          tokens.push({ type: "comment", value: code.slice(start, i) });
          continue;
        }

        if (char === '"' || char === "'" || char === "`") {
          const quote = char;
          const start = i;
          i++;
          while (i < code.length && code[i] !== quote) {
            if (code[i] === "\\") i++;
            i++;
          }
          i++;
          tokens.push({ type: "string", value: code.slice(start, i) });
          continue;
        }

        if (/\d/.test(char)) {
          const start = i;
          while (i < code.length && /[\d.]/.test(code[i])) i++;
          tokens.push({ type: "number", value: code.slice(start, i) });
          continue;
        }

        if (/[a-zA-Z_$]/.test(char)) {
          const start = i;
          while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) i++;
          const value = code.slice(start, i);

          let j = i;
          while (j < code.length && /\s/.test(code[j])) j++;
          const isFunction = code[j] === "(";

          let k = start - 1;
          while (k >= 0 && /\s/.test(code[k])) k--;
          const isProperty = code[k] === ".";

          let type = "text";
          if (keywords.has(value)) type = "keyword";
          else if (isProperty && isFunction) type = "function";
          else if (isProperty) type = "property";
          else if (isFunction) type = "function";
          else if (["items", "total", "i", "console"].includes(value))
            type = "variable";

          tokens.push({ type, value });
          continue;
        }

        tokens.push({ type: "text", value: char });
        i++;
      }

      return tokens
        .map((token) => {
          const escaped = token.value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

          switch (token.type) {
            case "keyword":
              return `<span style="color: var(--color-syn-keyword)">${escaped}</span>`;
            case "function":
              return `<span style="color: var(--color-syn-function)">${escaped}</span>`;
            case "variable":
              return `<span style="color: var(--color-syn-variable)">${escaped}</span>`;
            case "number":
              return `<span style="color: var(--color-syn-number)">${escaped}</span>`;
            case "string":
              return `<span style="color: var(--color-syn-string)">${escaped}</span>`;
            case "property":
              return `<span style="color: var(--color-syn-property)">${escaped}</span>`;
            case "comment":
              return `<span style="color: var(--color-syn-comment)">${escaped}</span>`;
            default:
              return escaped;
          }
        })
        .join("");
    };

    return (
      <div ref={ref} className={container({ className })} {...props}>
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
            {filename && <span className={filenameClass()}>{filename}</span>}
          </div>
        )}
        <div className={contentWrapper()}>
          {showLineNumbers && (
            <div className={lineNumbers()}>
              {lineNumbersArray.map((lineNumber) => (
                <div key={lineNumber}>{lineNumber}</div>
              ))}
            </div>
          )}
          <div className={content()}>
            <pre
              className="font-mono text-xs leading-5"
              style={{ color: "var(--color-syn-operator)" }}
              dangerouslySetInnerHTML={{ __html: highlightSyntax(children) }}
            />
          </div>
        </div>
      </div>
    );
  },
);

CodeBlock.displayName = "CodeBlock";
CodeBlockWithCopy.displayName = "CodeBlockWithCopy";

export { CodeBlock, CodeBlockWithCopy, codeBlockVariants };
