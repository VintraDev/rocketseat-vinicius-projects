"use client";

import Fuse from "fuse.js";
import { ChevronDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  languageDisplayNames,
  type SupportedLanguage,
  supportedLanguages,
} from "@/lib/syntax-highlighting";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  /**
   * Currently selected language
   */
  value?: SupportedLanguage;

  /**
   * Callback when language is selected
   */
  onValueChange: (language: SupportedLanguage) => void;

  /**
   * Optional confidence score to display
   */
  confidence?: number;

  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Whether the language was manually selected by user
   */
  isManual?: boolean;

  /**
   * Responsive behavior for mobile
   */
  responsive?: boolean;
}

/**
 * Popular languages that should appear at the top
 */
const popularLanguages: SupportedLanguage[] = [
  "javascript",
  "typescript",
  "python",
  "java",
  "html",
  "css",
  "json",
  "bash",
];

export function LanguageSelector({
  value,
  onValueChange,
  confidence,
  disabled = false,
  className,
  isManual = false,
  responsive = true,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Prepare search with Fuse.js
  const fuse = useMemo(() => {
    const options = {
      keys: ["name", "id"],
      threshold: 0.3, // Lower = more strict matching
      includeScore: true,
    };

    const searchableLanguages = supportedLanguages.map((lang) => ({
      id: lang,
      name: languageDisplayNames[lang],
    }));

    return new Fuse(searchableLanguages, options);
  }, []);

  // Filter and sort languages
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      // No search query - show popular first, then alphabetical
      const popular = popularLanguages.filter((lang) =>
        supportedLanguages.includes(lang),
      );

      const others = supportedLanguages
        .filter((lang) => !popularLanguages.includes(lang))
        .sort((a, b) =>
          languageDisplayNames[a].localeCompare(languageDisplayNames[b]),
        );

      return [...popular, ...others];
    }

    // Search query - use Fuse.js for fuzzy search
    const results = fuse.search(searchQuery);
    return results.map((result) => result.item.id as SupportedLanguage);
  }, [searchQuery, fuse]);

  const selectedDisplayName = value
    ? languageDisplayNames[value]
    : "Select language";

  const handleSelect = (language: SupportedLanguage) => {
    onValueChange(language);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery("");
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2",
          "border border-devroast-border rounded-md",
          "bg-devroast-surface text-devroast-text-primary",
          "text-sm font-mono leading-none",
          "transition-colors duration-150",
          "hover:border-devroast-text-muted focus:border-devroast-green",
          "focus:outline-none focus:ring-2 focus:ring-devroast-green/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          responsive && "text-xs sm:text-sm",
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select programming language"
      >
        <span className="flex items-center gap-2">
          <span className="truncate">{selectedDisplayName}</span>
          {confidence && confidence > 0 && !isManual && (
            <span className="text-devroast-text-secondary text-xs">
              ({Math.round(confidence * 100)}%)
            </span>
          )}
          {isManual && <span className="text-devroast-green text-xs">✓</span>}
        </span>
        <ChevronDownIcon
          className={cn(
            "w-4 h-4 text-devroast-text-muted transition-transform",
            isOpen && "transform rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 z-50 mt-1",
            "border border-devroast-border rounded-md",
            "bg-devroast-surface shadow-lg",
            "max-h-64 overflow-hidden",
            responsive && "sm:w-auto sm:min-w-full",
          )}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-devroast-border">
            <input
              type="text"
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full px-2 py-1",
                "bg-devroast-bg border border-devroast-border rounded",
                "text-devroast-text-primary text-sm font-mono",
                "placeholder:text-devroast-text-muted",
                "focus:outline-none focus:border-devroast-green",
                "focus:ring-1 focus:ring-devroast-green/20",
              )}
            />
          </div>

          {/* Language List */}
          <div className="overflow-y-auto max-h-48 scrollbar-thin">
            {filteredLanguages.length > 0 ? (
              <div>
                {filteredLanguages.map((language) => {
                  const isSelected = value === language;
                  const isPopular =
                    popularLanguages.includes(language) && !searchQuery;

                  return (
                    <button
                      key={language}
                      type="button"
                      onClick={() => handleSelect(language)}
                      className={cn(
                        "w-full px-3 py-2 text-left",
                        "text-sm font-mono leading-tight",
                        "transition-colors duration-100",
                        "hover:bg-devroast-bg",
                        "focus:outline-none focus:bg-devroast-bg",
                        isSelected &&
                          "bg-devroast-green/10 text-devroast-green",
                        !isSelected && "text-devroast-text-primary",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{languageDisplayNames[language]}</span>
                        {isPopular && (
                          <span className="text-xs text-devroast-text-muted">
                            Popular
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-devroast-text-muted text-center">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
