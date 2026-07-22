/**
 * Syntax highlighting utilities for DevRoast
 * Uses Shiki with custom DevRoast theme colors
 */

import type { ThemeRegistration } from "shiki";

/**
 * Custom DevRoast theme for Shiki syntax highlighting
 * Matches the CSS variables defined in globals.css
 */
export const devRoastTheme: ThemeRegistration = {
  name: "devroast-dark",
  type: "dark",
  colors: {
    "editor.background": "#0a0a0a", // --color-devroast-bg
    "editor.foreground": "#fafafa", // --color-devroast-text-primary
  },
  tokenColors: [
    {
      scope: [
        "comment",
        "comment.block",
        "comment.line",
        "comment.block.documentation",
      ],
      settings: {
        foreground: "#8b8b8b", // --color-syn-comment
        fontStyle: "italic",
      },
    },
    {
      scope: [
        "keyword",
        "keyword.control",
        "keyword.operator",
        "storage",
        "storage.type",
        "storage.modifier",
      ],
      settings: {
        foreground: "#c678dd", // --color-syn-keyword
      },
    },
    {
      scope: [
        "entity.name.function",
        "meta.function-call",
        "variable.function",
        "support.function",
        "keyword.other.special-method",
      ],
      settings: {
        foreground: "#61afef", // --color-syn-function
      },
    },
    {
      scope: [
        "variable",
        "variable.parameter",
        "variable.other",
        "meta.definition.variable.name",
        "support.variable",
      ],
      settings: {
        foreground: "#e06c75", // --color-syn-variable
      },
    },
    {
      scope: [
        "constant.numeric",
        "constant.language",
        "support.constant",
        "constant.character",
        "constant.escape",
        "variable.parameter.function.language.special",
        "variable.parameter.function.language.special.self.python",
      ],
      settings: {
        foreground: "#d19a66", // --color-syn-number
      },
    },
    {
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "string.unquoted",
        "string.interpolated",
        "string.regexp",
      ],
      settings: {
        foreground: "#e5c07b", // --color-syn-string
      },
    },
    {
      scope: [
        "variable.property",
        "meta.property-name",
        "support.type.property-name",
        "entity.name.tag.yaml",
        "entity.other.attribute-name",
      ],
      settings: {
        foreground: "#98c379", // --color-syn-property
      },
    },
    {
      scope: [
        "punctuation",
        "meta.delimiter",
        "meta.bracket",
        "punctuation.definition.template-expression",
        "punctuation.section.embedded",
      ],
      settings: {
        foreground: "#abb2bf", // --color-syn-operator
      },
    },
    {
      scope: ["entity.name.tag", "meta.tag", "markup.deleted.git_gutter"],
      settings: {
        foreground: "#e06c75", // Red for HTML tags
      },
    },
    {
      scope: [
        "entity.other.attribute-name.id",
        "entity.other.attribute-name.class",
        "meta.selector",
      ],
      settings: {
        foreground: "#98c379", // Green for CSS selectors
      },
    },
  ],
};

/**
 * Supported languages for syntax highlighting
 * Starting with the 10 most popular as specified in the spec
 */
export const supportedLanguages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "go",
  "rust",
  "css",
  "html",
  "json",
  "jsx",
  "tsx",
  "bash",
  "shell",
  "sql",
  "yaml",
  "xml",
  "php",
  "ruby",
  "swift",
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

/**
 * Language display names for the UI
 */
export const languageDisplayNames: Record<SupportedLanguage, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  csharp: "C#",
  go: "Go",
  rust: "Rust",
  css: "CSS",
  html: "HTML",
  json: "JSON",
  jsx: "React JSX",
  tsx: "React TSX",
  bash: "Bash",
  shell: "Shell",
  sql: "SQL",
  yaml: "YAML",
  xml: "XML",
  php: "PHP",
  ruby: "Ruby",
  swift: "Swift",
};

/**
 * Language aliases for better detection
 */
export const languageAliases: Record<string, SupportedLanguage> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  cs: "csharp",
  rs: "rust",
  sh: "bash",
  zsh: "bash",
  fish: "bash",
  yml: "yaml",
  htm: "html",
};

/**
 * Get the Shiki language key from a language string
 */
export function getShikiLanguage(language: string): SupportedLanguage {
  const normalized = language.toLowerCase();

  // Check direct match
  if (supportedLanguages.includes(normalized as SupportedLanguage)) {
    return normalized as SupportedLanguage;
  }

  // Check aliases
  if (languageAliases[normalized]) {
    return languageAliases[normalized];
  }

  // Default fallback
  return "javascript";
}

/**
 * Get display name for a language
 */
export function getLanguageDisplayName(language: string): string {
  const shikiLang = getShikiLanguage(language);
  return languageDisplayNames[shikiLang] || language;
}
