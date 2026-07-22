/**
 * Language detection for code syntax highlighting
 * Uses highlight.js and heuristic detection for reliable language identification
 */

import type { HLJSApi } from "highlight.js";
import type { SupportedLanguage } from "@/lib/syntax-highlighting";

let hljs: HLJSApi | null = null;

/**
 * Language detection result
 */
export interface LanguageDetectionResult {
  languageId: string;
  confidence: number;
}

/**
 * Lazy load highlight.js detection system
 */
async function loadHighlightJS() {
  if (!hljs) {
    try {
      const module = await import("highlight.js");
      hljs = module.default;
    } catch (error) {
      console.warn("Failed to load highlight.js:", error);
      hljs = null;
    }
  }
  return hljs;
}

/**
 * Map highlight.js language names to our supported languages
 */
const hljsToSupportedLanguage: Record<string, SupportedLanguage> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  csharp: "csharp",
  go: "go",
  rust: "rust",
  css: "css",
  html: "html",
  json: "json",
  jsx: "javascript", // Map JSX to JavaScript for highlighting
  tsx: "typescript", // Map TSX to TypeScript for highlighting
  bash: "bash",
  shell: "bash",
  sql: "sql",
  yaml: "yaml",
  xml: "xml",
  php: "php",
  ruby: "ruby",
  swift: "swift",
  // Additional common mappings
  js: "javascript",
  ts: "typescript",
  py: "python",
  rs: "rust",
  sh: "bash",
  yml: "yaml",
  rb: "ruby",
  cs: "csharp",
  // Fix common mis-detections
  "c-like": "javascript", // Sometimes highlight.js returns this for JS
  coffeescript: "javascript", // Often confused with JS
};

/**
 * Detect language using highlight.js auto-detection
 */
async function detectWithHighlightJS(
  code: string,
): Promise<{ language: SupportedLanguage; confidence: number } | null> {
  try {
    const highlightjs = await loadHighlightJS();
    if (!highlightjs || !highlightjs.highlightAuto) {
      return null;
    }

    const result = highlightjs.highlightAuto(code);
    if (!result || !result.language) {
      return null;
    }

    const supportedLanguage =
      hljsToSupportedLanguage[result.language.toLowerCase()];
    if (!supportedLanguage) {
      return null;
    }

    // Convert highlight.js relevance to confidence (0-1)
    // Typical relevance is 0-30, so normalize to 0-1
    const confidence = Math.min(Math.max(result.relevance / 20, 0.1), 0.95);

    return {
      language: supportedLanguage,
      confidence,
    };
  } catch (error) {
    console.warn("highlight.js detection failed:", error);
    return null;
  }
}

/**
 * Main language detection function with multiple fallbacks
 */
export async function detectLanguage(
  code: string,
): Promise<{ language: SupportedLanguage; confidence: number } | null> {
  try {
    // Don't detect for very short code snippets
    if (code.trim().length < 10) {
      return null;
    }

    // Check if running in browser
    if (typeof window === "undefined") {
      console.warn("Language detection not available on server");
      return null;
    }

    // Try highlight.js first
    try {
      const hljsResult = await detectWithHighlightJS(code);
      if (hljsResult && hljsResult.confidence > 0.4) {
        // Increased confidence threshold
        console.log(
          `Language detected by highlight.js: ${hljsResult.language} (${Math.round(hljsResult.confidence * 100)}%)`,
        );
        return hljsResult;
      }
    } catch (hljsError) {
      console.warn(
        "highlight.js detection failed, trying heuristic:",
        hljsError,
      );
    }

    // Try heuristic detection as fallback
    const heuristicResult = detectLanguageHeuristic(code);
    if (heuristicResult) {
      console.log(`Language detected by heuristic: ${heuristicResult}`);
      return {
        language: heuristicResult,
        confidence: 0.8, // Higher confidence for improved heuristic detection
      };
    }

    // No detection succeeded
    return null;
  } catch (error) {
    console.warn("All language detection methods failed:", error);
    return null;
  }
}

/**
 * Enhanced heuristic-based language detection
 */
export function detectLanguageHeuristic(
  code: string,
): SupportedLanguage | null {
  const trimmed = code.trim();

  if (trimmed.length < 5) {
    return null;
  }

  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === "development") {
    console.log(
      "Heuristic detection for code:",
      `${trimmed.substring(0, 50)}...`,
    );
  }

  // Helper function to check if content looks like CSS
  function isCssLike(content: string): boolean {
    return (
      /@media\s/.test(content) ||
      /@import\s/.test(content) ||
      /@keyframes\s/.test(content) ||
      /\.([\w-]+)\s*\{/.test(content) ||
      /#[\w-]+\s*\{/.test(content) ||
      // CSS properties that are rarely used as JS object keys
      /\b(display|position|margin|padding|background|color|font-size|width|height|border|opacity|transform)\s*:/.test(
        content,
      )
    );
  }

  // JSON detection (must be first to avoid false positives)
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      JSON.parse(trimmed);
      console.log("Detected as JSON");
      return "json";
    } catch {
      // Not valid JSON, continue checking
      console.log("Not valid JSON, continuing...");
    }
  }

  // HTML detection (early to catch HTML files with CSS/JS)
  if (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.includes("<html>") ||
    trimmed.includes("</html>") ||
    (trimmed.includes("<") &&
      trimmed.includes(">") &&
      /<[a-zA-Z][^>]*>/.test(trimmed) &&
      // Ensure it's not just comparison operators
      /<\/[a-zA-Z][^>]*>/.test(trimmed))
  ) {
    console.log("Detected as HTML");
    return "html";
  }

  // TypeScript detection (must come before JavaScript)
  if (
    trimmed.includes("interface ") ||
    trimmed.includes(": string") ||
    trimmed.includes(": number") ||
    trimmed.includes(": boolean") ||
    trimmed.includes("type ") ||
    /<[A-Z]\w*>/.test(trimmed) ||
    trimmed.includes("extends ") ||
    trimmed.includes("implements ") ||
    /:\s*(string|number|boolean|void|any|unknown)\b/.test(trimmed) ||
    trimmed.includes("as ") ||
    trimmed.includes("enum ")
  ) {
    console.log("Detected as TypeScript");
    return "typescript";
  }

  // JavaScript detection (more comprehensive patterns)
  if (
    trimmed.includes("function ") ||
    /function\s*\w*\s*\(/.test(trimmed) || // function declarations
    trimmed.includes("=>") ||
    trimmed.includes("const ") ||
    trimmed.includes("let ") ||
    trimmed.includes("var ") ||
    trimmed.includes("console.log") ||
    trimmed.includes("console.") ||
    trimmed.includes("require(") ||
    trimmed.includes("import ") ||
    trimmed.includes("export ") ||
    /\b(document|window|alert|setTimeout|setInterval)\b/.test(trimmed) ||
    // For loops and control structures
    /for\s*\(\s*(let|var|const|)\s*\w+/.test(trimmed) ||
    /if\s*\(.*\)\s*\{/.test(trimmed) ||
    // Object/array patterns common in JS but ensure it's not CSS
    (/\{[\s\S]*:[\s\S]*\}/.test(trimmed) && !isCssLike(trimmed)) ||
    /\[[\s\S]*\]/.test(trimmed) ||
    // Method calls
    /\w+\(\)/.test(trimmed) ||
    /\w+\([^)]*\)/.test(trimmed) ||
    // Common JS patterns
    /\${/.test(trimmed) || // Template literals
    /\.then\(/.test(trimmed) || // Promises
    /async\s+/.test(trimmed) || // Async functions
    /await\s+/.test(trimmed) || // Await calls
    // Variable assignments
    /\w+\s*=\s*/.test(trimmed) ||
    // Common JS keywords
    /\b(return|break|continue|switch|case|default|try|catch|finally|throw|new|this|typeof|instanceof)\b/.test(
      trimmed,
    )
  ) {
    console.log("Detected as JavaScript");
    return "javascript";
  }

  // CSS detection (after JS/TS to avoid conflicts)
  if (
    trimmed.includes("{") &&
    trimmed.includes("}") &&
    // More specific CSS pattern to avoid JS object confusion
    (/^[^{}]*\{[^{}]*[a-zA-Z-]+\s*:\s*[^;{}]+;[^{}]*\}/.test(trimmed) ||
      /@media\s/.test(trimmed) ||
      /@import\s/.test(trimmed) ||
      /@keyframes\s/.test(trimmed) ||
      /\.([\w-]+)\s*\{/.test(trimmed) ||
      /#[\w-]+\s*\{/.test(trimmed) ||
      // CSS properties that are rarely used as JS object keys
      /\b(display|position|margin|padding|background|color|font-size|width|height)\s*:/.test(
        trimmed,
      ))
  ) {
    console.log("Detected as CSS");
    return "css";
  }

  // Python detection
  if (
    trimmed.includes("def ") ||
    trimmed.includes("import ") ||
    trimmed.includes("from ") ||
    trimmed.includes("print(") ||
    /^\s*#/.test(trimmed) ||
    trimmed.includes("if __name__")
  ) {
    console.log("Detected as Python");
    return "python";
  }

  // Java detection
  if (
    trimmed.includes("public class ") ||
    trimmed.includes("import java.") ||
    trimmed.includes("public static void main") ||
    trimmed.includes("System.out.println")
  ) {
    console.log("Detected as Java");
    return "java";
  }

  // Go detection
  if (
    trimmed.includes("func ") ||
    trimmed.includes("package main") ||
    trimmed.includes('import "') ||
    trimmed.includes("fmt.Println")
  ) {
    console.log("Detected as Go");
    return "go";
  }

  // Rust detection
  if (
    trimmed.includes("fn ") ||
    trimmed.includes("let mut ") ||
    trimmed.includes("println!") ||
    trimmed.includes("use std::")
  ) {
    console.log("Detected as Rust");
    return "rust";
  }

  // C# detection
  if (
    trimmed.includes("using System;") ||
    trimmed.includes("namespace ") ||
    trimmed.includes("public class ") ||
    trimmed.includes("Console.WriteLine")
  ) {
    console.log("Detected as C#");
    return "csharp";
  }

  // PHP detection
  if (trimmed.startsWith("<?php") || trimmed.includes("$")) {
    console.log("Detected as PHP");
    return "php";
  }

  // Ruby detection
  if (
    trimmed.includes("def ") ||
    trimmed.includes("puts ") ||
    trimmed.includes('require "') ||
    trimmed.includes("class ") ||
    trimmed.includes("end")
  ) {
    console.log("Detected as Ruby");
    return "ruby";
  }

  // SQL detection
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i.test(trimmed)) {
    console.log("Detected as SQL");
    return "sql";
  }

  // YAML detection
  if (
    trimmed.includes("---") ||
    /^\s*\w+:\s*/.test(trimmed) ||
    /^\s*-\s+/.test(trimmed)
  ) {
    console.log("Detected as YAML");
    return "yaml";
  }

  // XML detection
  if (
    trimmed.startsWith("<?xml") ||
    (trimmed.includes("<") && trimmed.includes("/>"))
  ) {
    console.log("Detected as XML");
    return "xml";
  }

  // Bash/Shell detection
  if (
    trimmed.startsWith("#!/bin/bash") ||
    trimmed.startsWith("#!/bin/sh") ||
    trimmed.includes("echo ") ||
    /\$\{?\w+\}?/.test(trimmed)
  ) {
    console.log("Detected as Bash");
    return "bash";
  }

  console.log("No language detected by heuristic");
  // Default fallback
  return null;
}
