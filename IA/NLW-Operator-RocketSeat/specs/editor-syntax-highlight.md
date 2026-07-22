# Editor com Syntax Highlighting - Especificação Técnica

## 🎯 Visão Geral

Este documento especifica a implementação de um editor de código com syntax highlighting automático para o DevRoast. O objetivo é criar um editor que detecte automaticamente a linguagem do código e aplique as cores de sintaxe correspondentes, mantendo a qualidade e experiência do usuário similar ao ray-so.

## 📋 Requisitos Funcionais

### RF01 - Editor de Código Base
- Editor de texto com fonte monoespaçada
- Suporte a colar código (Ctrl+V)
- Quebra de linha automática ou scroll horizontal
- Numeração de linhas (opcional)
- Altura dinâmica baseada no conteúdo

### RF02 - Detecção Automática de Linguagem
- Detectar linguagem do código automaticamente quando colado
- Suporte a pelo menos 30+ linguagens populares
- Confidence score para cada detecção
- Fallback para "plaintext" quando incerto

### RF03 - Seleção Manual de Linguagem
- Dropdown/combobox para seleção manual
- Override da detecção automática
- Lista de linguagens mais comuns no topo
- Busca/filtro de linguagens

### RF04 - Syntax Highlighting
- Cores específicas do tema DevRoast
- Highlighting em tempo real
- Suporte a nested highlighting (ex: CSS em HTML)
- Performance otimizada para códigos grandes

### RF05 - Integração com DevRoast
- Manter o design system existente
- Responsivo (mobile-first)
- Acessibilidade (ARIA, keyboard navigation)
- Tema escuro consistente

## 🔍 Análise das Tecnologias

### 1. **Shiki** (Recomendação Principal) ⭐
**Usado por:** ray-so, GitHub, VS Code

**Vantagens:**
- Usa as mesmas grammar files do VS Code
- Suporte a 150+ linguagens
- Temas do VS Code compatíveis
- Bundle size otimizado (tree shaking)
- TypeScript nativo
- WASM para performance

**Implementação no ray-so:**
```typescript
import { getHighlighterCore } from "shiki";
import getWasm from "shiki/wasm";

const highlighter = await getHighlighterCore({
  themes: [customTheme],
  langs: [javascript, typescript, python],
  loadWasm: getWasm,
});
```

**Bundle Size:** ~50KB (core) + linguagens específicas
**Performance:** Excelente (WASM + tree shaking)

### 2. **Prism.js** (Alternativa Sólida)
**Usado por:** MDN, GitHub (markdown), muitos blogs

**Vantagens:**
- Lightweight (~8KB core)
- Plugin system extensível
- Boa documentação
- Fácil customização

**Desvantagens:**
- Grammar próprio (não VS Code)
- Menos linguagens que Shiki
- Manual highlighting trigger

### 3. **Highlight.js** (Alternativa Simples)
**Usado por:** StackOverflow, GitLab

**Vantagens:**
- Auto-detecção built-in
- 190+ linguagens
- Zero dependências

**Desvantagens:**
- Bundle maior para muitas linguagens
- Menos customizável
- Performance inferior ao Shiki

### 4. **CodeMirror 6** (Editor Completo)
**Usado por:** Observable, Svelte REPL

**Vantagens:**
- Editor completo com features avançadas
- Highlight + editing integrados
- Extensible architecture

**Desvantagens:**
- Overkill para nosso caso
- Bundle size muito grande
- Complexidade desnecessária

## 🤖 Detecção Automática de Linguagem

### 1. **@vscode/vscode-languagedetection** (Recomendação) ⭐
**Usado por:** VS Code

**Vantagens:**
- Modelo ML treinado pela Microsoft
- Precisão de 90%+
- Suporte a 30 linguagens principais
- TypeScript nativo
- 2MB modelo (carregamento otimizado)

```typescript
import { ModelOperations } from "@vscode/vscode-languagedetection";

const model = new ModelOperations();
const result = await model.runModel(codeString);
// [{ languageId: 'ts', confidence: 0.48 }, ...]
```

### 2. **guesslang** (Alternativa Python/Web)
- Modelo ML original (base do VS Code)
- 54 linguagens
- Python apenas (precisaria de port/API)

### 3. **Heurística Simples** (Backup)
- Análise de palavras-chave
- Extensões de arquivo
- Padrões regex
- Menos preciso, mas sem dependência ML

## 🎨 Design System Integration

### Cores de Syntax (DevRoast Theme)
```css
/* Já implementado em globals.css */
--color-syn-keyword: #c678dd;    /* function, var, for, if */
--color-syn-function: #61afef;   /* function names */
--color-syn-variable: #e06c75;   /* variables */
--color-syn-number: #d19a66;     /* numbers */
--color-syn-string: #e5c07b;     /* strings */
--color-syn-property: #98c379;   /* properties */
--color-syn-operator: #abb2bf;   /* operators */
--color-syn-comment: #8b8b8b;    /* comments */
```

### Componente Target
- Evoluir o `EditableCodeInput` existente
- Manter compatibilidade com props atuais
- Adicionar props para language detection

## 🏗️ Arquitetura Proposta

```
src/
├── components/ui/
│   ├── code-editor/
│   │   ├── index.tsx              # CodeEditor principal
│   │   ├── language-detector.ts   # Detecção automática
│   │   ├── language-selector.tsx  # Dropdown manual
│   │   ├── syntax-highlighter.ts  # Shiki wrapper
│   │   └── languages.ts           # Lista de linguagens
│   └── editable-code-input.tsx    # Evoluir existente
├── lib/
│   └── syntax-highlighting.ts     # Utils compartilhadas
└── hooks/
    ├── use-language-detection.ts  # Hook para detecção
    └── use-syntax-highlighter.ts  # Hook para highlighting
```

### Componente Principal
```typescript
interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;              // Manual override
  autoDetectLanguage?: boolean;   // Default: true
  showLanguageSelector?: boolean; // Default: true
  showLineNumbers?: boolean;      // Default: true
  responsive?: boolean;           // Default: true
  height?: "auto" | "fixed" | "adaptive";
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  autoDetectLanguage = true,
  showLanguageSelector = true,
  ...props
}) => {
  // Implementation
};
```

## 📦 Dependências Necessárias

```json
{
  "dependencies": {
    "shiki": "^1.0.0",
    "@vscode/vscode-languagedetection": "^1.0.23",
    "fuse.js": "^7.0.0" // Para busca de linguagens
  }
}
```

**Bundle Impact:** ~2.5MB total (2MB ML model + 500KB Shiki)
**Lazy Loading:** Carregar model apenas quando necessário

## ⚡ Performance Considerations

### Lazy Loading Strategy
```typescript
// Carregar apenas quando necessário
const loadLanguageDetection = () => 
  import("@vscode/vscode-languagedetection");

const loadShiki = () => 
  import("shiki").then(shiki => 
    shiki.getHighlighterCore({/* config */})
  );
```

### Caching Strategy
- Cache do modelo ML no localStorage
- Cache de highlighting results
- Debounce na detecção automática (500ms)

### Bundle Optimization
- Tree shaking para linguagens não utilizadas
- Dynamic imports para reduzir initial bundle
- Service Worker para cache do modelo

## 🎯 Implementação em Fases

### Phase 1: Core Highlighting ⏱️ 2-3 dias
- [ ] Setup Shiki com tema DevRoast
- [ ] Evolução do EditableCodeInput
- [ ] Suporte a 5 linguagens principais (JS, TS, Python, CSS, HTML)
- [ ] Seleção manual de linguagem

### Phase 2: Auto Detection ⏱️ 2-3 dias
- [ ] Integração do vscode-languagedetection
- [ ] Detecção automática on paste
- [ ] UI feedback durante detecção
- [ ] Fallback para heurísticas simples

### Phase 3: Enhancement ⏱️ 2-3 dias
- [ ] Suporte a 30+ linguagens
- [ ] Performance optimization
- [ ] Busca de linguagens no selector
- [ ] Tests e documentação

### Phase 4: Polish ⏱️ 1-2 dias
- [ ] Acessibilidade
- [ ] Error boundaries
- [ ] Analytics para linguagens mais usadas
- [ ] Mobile optimization

## 🧪 Testing Strategy

### Unit Tests
- Language detection accuracy
- Syntax highlighting output
- Component prop combinations
- Error handling

### Integration Tests
- Copy/paste functionality
- Language selector interaction
- Real-world code samples
- Performance benchmarks

### E2E Tests
- User workflows completos
- Mobile responsiveness
- Cross-browser compatibility

## 🔒 Considerações de Segurança

### XSS Prevention
- Sanitização do HTML gerado pelo Shiki
- Content Security Policy headers
- Escape de user input

### Performance Limits
- Limite de tamanho do código (100KB)
- Timeout para detecção (5 segundos)
- Rate limiting no ML model

## 📊 Analytics & Monitoring

### Métricas Importantes
- Languagens mais detectadas
- Accuracy da detecção automática
- Performance do highlighting
- Bounce rate no editor

### Error Tracking
- ML model failures
- Shiki loading errors
- Browser compatibility issues

## ❓ Perguntas e Decisões Pendentes

### 1. **Estratégia de Carregamento**
- Carregar o modelo ML no primeiro uso ou page load?
- **Recomendação:** First use para reduzir bundle inicial

### 2. **Linguagens Suportadas**
- Priorizar quais linguagens?
- **Sugestão:** JS, TS, Python, Java, C#, Go, Rust, CSS, HTML, JSON

### 3. **Feedback Visual**
- Como mostrar o confidence score da detecção?
- **Sugestão:** Badge subtle próximo ao language selector

### 4. **Mobile Experience**
- Language selector como modal ou dropdown?
- **Sugestão:** Modal no mobile, dropdown no desktop

### 5. **Backward Compatibility**
- Migração do EditableCodeInput existente?
- **Sugestão:** Props adicionais, manter API existente

## 🚀 Success Criteria

### Funcional
- [x] Detecção automática com 85%+ accuracy
- [x] Highlighting em <100ms para códigos pequenos
- [x] Suporte a 20+ linguagens principais
- [x] Mobile-first responsive

### Técnico
- [x] Bundle size <3MB total
- [x] First load <1 segundo
- [x] Zero layout shifts
- [x] 95+ Lighthouse score

### UX
- [x] Seamless copy/paste experience
- [x] Visual feedback claro
- [x] Fallback gracioso para errors
- [x] Acessibilidade WCAG 2.1 AA

## 📚 Referências

- [Shiki Documentation](https://shiki.style/)
- [VS Code Language Detection](https://github.com/microsoft/vscode-languagedetection)
- [ray-so Source Code](https://github.com/raycast/ray-so)
- [Web Performance Best Practices](https://web.dev/performance/)

---

**Status:** 📋 Especificação Completa  
**Próximo Passo:** Review e aprovação para iniciar Phase 1  
**Estimativa Total:** 8-11 dias de desenvolvimento