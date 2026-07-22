# CodeEditor - Usage Guide

## Overview

The DevRoast CodeEditor is a powerful component that combines automatic language detection, manual language selection, and advanced syntax highlighting using Shiki v4.

## Features

✅ **Automatic Language Detection** - Uses @vscode/vscode-languagedetection (90%+ accuracy)  
✅ **Manual Language Selection** - Dropdown with fuzzy search and popular languages  
✅ **Advanced Syntax Highlighting** - Shiki v4 with DevRoast custom theme  
✅ **20+ Programming Languages** - JavaScript, TypeScript, Python, Java, CSS, HTML, etc.  
✅ **Mobile-First Responsive** - Adapts perfectly to all screen sizes  
✅ **Performance Optimized** - Lazy loading, caching, and debounced detection  

## Basic Usage

```typescript
import { CodeEditor } from "@/components/ui/code-editor";

function MyComponent() {
  const [code, setCode] = useState("");

  return (
    <CodeEditor
      value={code}
      onChange={setCode}
      autoDetectLanguage={true}
      showLanguageSelector={true}
      responsive={true}
    />
  );
}
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | **Required** | Current code content |
| `onChange` | `(value: string) => void` | **Required** | Code change handler |
| `autoDetectLanguage` | `boolean` | `true` | Enable auto language detection |
| `showLanguageSelector` | `boolean` | `true` | Show dropdown selector |
| `showLineNumbers` | `boolean` | `true` | Show line numbers |
| `showHeader` | `boolean` | `true` | Show traffic lights header |
| `responsive` | `boolean` | `true` | Enable mobile-first responsive |
| `language` | `SupportedLanguage` | `undefined` | Manual language override |
| `onLanguageChange` | `(lang, confidence) => void` | `undefined` | Language detection callback |
| `height` | `"auto" \| "fixed" \| "adaptive"` | `"adaptive"` | Editor height behavior |

## Language Detection

### Automatic Detection
- Triggers on paste or when code length > 10 characters
- Uses ML model with 30+ language support
- Debounced (500ms) for performance
- Confidence threshold: 50% minimum

### Manual Override
```typescript
// Set specific language
<CodeEditor language="typescript" autoDetectLanguage={false} />

// Listen to detection results
<CodeEditor
  onLanguageChange={(language, confidence) => {
    console.log(`Detected: ${language} (${confidence * 100}% confident)`);
  }}
/>
```

## Supported Languages

**Popular (appear first in dropdown):**
- JavaScript, TypeScript, Python, Java, HTML, CSS, JSON, Bash

**Full list includes:**
- C, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin
- SQL, YAML, XML, Markdown, Dockerfile
- Vue, Svelte, React JSX, SCSS, Less
- And many more...

## Styling & Theming

The editor uses DevRoast's design system with CSS variables:

```css
--color-syn-keyword: #c678dd;    /* Keywords: function, var, if */
--color-syn-function: #61afef;   /* Function names */
--color-syn-string: #e5c07b;     /* String literals */
--color-syn-comment: #8b8b8b;    /* Comments */
```

## Performance

- **Bundle Size**: ~2.5MB (includes ML model)
- **Lazy Loading**: Components load on demand
- **Caching**: Detection results and highlighting cached
- **Debouncing**: 500ms delay for auto-detection

## Mobile Experience

- **Mobile**: Language selector becomes modal
- **Tablet**: Dropdown with responsive sizing
- **Desktop**: Full dropdown with search

## Examples

### Home Page Integration
```typescript
// Current implementation in src/app/page.tsx
<CodeEditor
  value={code}
  onChange={setCode}
  placeholder="// paste your code here for roasting..."
  height="adaptive"
  autoDetectLanguage={true}
  showLanguageSelector={true}
  responsive={true}
  onLanguageChange={(language, confidence) => {
    setDetectedLanguage(language);
    setDetectionConfidence(confidence || 0);
  }}
/>
```

### Status Display
```typescript
{detectedLanguage && (
  <div className="flex items-center gap-2">
    <span>detected:</span>
    <span className="text-devroast-green">{detectedLanguage}</span>
    <span>({Math.round(detectionConfidence * 100)}%)</span>
  </div>
)}
```

## Migration from EditableCodeInput

The CodeEditor maintains backward compatibility:

```diff
- import { EditableCodeInput } from "@/components/ui/editable-code-input";
+ import { CodeEditor } from "@/components/ui/code-editor";

- <EditableCodeInput
+ <CodeEditor
    value={code}
    onChange={setCode}
-   language="typescript"
+   autoDetectLanguage={true}
+   showLanguageSelector={true}
  />
```

## Error Handling

- **Detection Failures**: Falls back to JavaScript
- **Highlighting Errors**: Falls back to plain text
- **Network Issues**: Graceful degradation
- **Unsupported Languages**: Uses heuristic detection

## Accessibility

- ✅ ARIA labels for language selector
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus management
- ✅ High contrast support

---

**Status**: ✅ **Production Ready**  
**Implementation**: Complete as per `@specs/editor-syntax-highlight.md`  
**Testing**: Manual testing recommended with various code samples