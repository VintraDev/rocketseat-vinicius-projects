# Padrões e Convenções de Desenvolvimento - DevRoast

## Resumo do Projeto

Este projeto é uma implementação Next.js que replica o design do DevRoast, uma aplicação de revisão de código baseada em um arquivo Pencil (.pen). O objetivo é criar uma implementação pixel-perfect da UI seguindo as especificações exatas do design.

## Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx          # Layout raiz com configuração de fontes
│   ├── page.tsx            # Aplicação principal DevRoast
│   ├── components/page.tsx # Biblioteca de componentes
│   └── globals.css         # Variáveis CSS e design tokens
├── components/
│   └── ui/
│       ├── agents.md       # Padrões específicos de componentes
│       └── button.tsx      # Componente Button com variantes
└── Downloads/devroast.pen  # Arquivo de design original
```

## Configuração de Tecnologias

### Stack Principal
- **Next.js** com TypeScript
- **Tailwind CSS v4** para estilização
- **tailwind-variants** para componentes tipados
- **Biome** para linting e formatação

### Dependências Importantes
- `tailwind-variants` - Para criação de componentes com variantes
- `@next/font` - Para configuração de fontes
- `react-syntax-highlighter` - Para highlight de código

## Design System

### Cores (CSS Variables)
```css
/* DevRoast Palette */
--color-devroast-bg: #0a0a0a              # Fundo principal
--color-devroast-text-primary: #fafafa     # Texto principal
--color-devroast-text-secondary: #6b7280   # Texto secundário
--color-devroast-text-muted: #4b5563       # Texto menos relevante
--color-devroast-border: #2a2a2a           # Bordas
--color-devroast-surface: #0f0f0f          # Superfícies
--color-devroast-green: #10b981            # Verde principal
--color-devroast-orange: #f59e0b           # Laranja
--color-devroast-red: #ef4444              # Vermelho
--color-devroast-code-orange: #ffc799      # Laranja do código

/* Cores do tema geral */
--color-background: #0b1020
--color-foreground: #e6ecff
--color-primary: #4f8cff
--color-button-primary: #10b981
```

### Typography
```css
/* Fontes */
--font-sans: "Sora", "Inter", "Segoe UI", "Helvetica Neue", "Arial", sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", "Cascadia Mono", "Menlo", "Consolas", monospace;
```

### Spacing & Layout
```css
/* Radius */
--radius-sm: 8px
--radius-md: 12px 
--radius-lg: 16px
--radius-button: 0px  # Botões sem borda arredondada

/* Shadows */
--shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.25)
--shadow-md: 0 10px 30px rgba(0, 0, 0, 0.3)
```

## Convenções de Código

### 1. Uso de CSS Variables (ATUALIZADO - Tailwind v4)
**✅ SINTAXE CORRETA:**
```tsx
className="text-devroast-green"           # Classes semânticas geradas pelo @theme
className="bg-button-primary"             # Para cores de botão
className="border-devroast-border"        # Para bordas
```

**❌ SINTAXE INCORRETA (OBSOLETA):**
```tsx
className="text-(--color-devroast-green)" # Não funciona no Tailwind v4
className="bg-(--color-button-primary)"   # Sintaxe malformada
className="text-[#10B981]"                # Evitar hardcoded sempre
```

### 2. @theme Directive - Tailwind CSS v4
O arquivo `globals.css` usa a diretiva `@theme` para definir design tokens:

```css
@import "tailwindcss";

@theme {
  /* Cores DevRoast - Geram automaticamente classes como bg-devroast-bg, text-devroast-green */
  --color-devroast-bg: #0a0a0a;
  --color-devroast-green: #10b981;
  --color-button-primary: #10b981;
  
  /* Fontes - Geram classes como font-mono, font-sans */
  --font-mono: "JetBrains Mono", "Fira Code", "Cascadia Mono", monospace;
}
```

### 3. Typography Classes
**✅ FAZER:**
```tsx
className="font-mono"          # Para elementos de código/UI
className="font-sans"          # Para texto corrido
```

**❌ EVITAR:**
```tsx
className="font-(--font-jetbrains-mono)"  # Obsoleto no Tailwind v4
```

### 4. Utility Classes Semânticas
**✅ FAZER:**
```tsx
className="h-5.5"                    # Usar utilitários Tailwind quando disponível
className="rounded-md"               # Preferir tokens semânticos
className="bg-devroast-green"        # Classes geradas pelo @theme
className="text-devroast-text-primary" # Nomeação semântica
```

**❌ EVITAR:**
```tsx
className="h-[22px]"                    # Evitar valores arbitrários
className="rounded-[12px]"              # Quando existir token
className="bg-(--color-devroast-green)" # Sintaxe malformada v4
```

### 5. Configuração PostCSS para Tailwind v4
Arquivo `postcss.config.mjs` deve estar configurado corretamente:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**IMPORTANTE:** Não usar `postcss-import` ou `autoprefixer` - já incluídos no v4.

### 6. Component Variants (Atualizado)
Use `tailwind-variants` com as classes corretas do Tailwind v4:

```tsx
import { tv, type VariantProps } from "tailwind-variants";

const componentVariants = tv({
  base: "font-mono bg-devroast-bg text-devroast-text-primary",
  variants: {
    variant: {
      primary: "bg-button-primary text-button-primary-foreground",
      secondary: "border-devroast-border bg-devroast-surface",
    }
  }
});
```

### 7. Estrutura de Arquivos
- Componentes em `src/components/ui/`
- Páginas em `src/app/`
- Tipos globais podem ser criados em `src/types/`
- Utils em `src/lib/` se necessário
- **PostCSS config**: `postcss.config.mjs` na raiz

## Padrões de Componentes

### Button Component
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Ghost Action</Button>
```

### Especificações do Design
- **Primary Button**: fundo verde (#10B981), texto preto, sem border-radius
- **Secondary Button**: borda cinza, fundo transparente
- **Ghost Button**: sem borda, hover com fundo cinza

## Guidelines de Desenvolvimento

### 1. Análise do Design
- Sempre consultar `/home/vinicius/Downloads/devroast.pen` para especificações
- Usar ferramentas Pencil MCP para extrair medidas exatas
- Implementar pixel-perfect seguindo as especificações

### 2. CSS Variables First
- Todas as cores devem usar CSS variables
- Evitar hardcoded values
- Manter consistência com o design system

### 3. Tailwind v4 Best Practices (ATUALIZADO)
- **USAR classes semânticas**: `bg-devroast-green`, `text-button-primary`
- **EVITAR sintaxe malformada**: ~~`bg-(--color-devroast-green)`~~
- **Configurar @theme** corretamente em `globals.css`
- **PostCSS config** deve usar `@tailwindcss/postcss`
- Preferir utilitários semânticos quando disponível
- Evitar classes arbitrárias quando existe alternativa

### 4. Component Architecture
- Usar `tailwind-variants` para estilização
- Componentes devem ser tipados com TypeScript
- Seguir padrões de composição React

### 5. Performance
- Usar `@next/font` para otimização de fontes
- Evitar CSS-in-JS desnecessário
- Preferir Tailwind utilities

## Comandos Importantes

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Linting
npm run lint

# Verificar tipos
npm run type-check
```

## Estrutura de Pastas para Novos Componentes

```
src/components/ui/
├── button.tsx
├── input.tsx          # Próximo componente
├── card.tsx           # Próximo componente
└── agents.md          # Documentação específica
```

## Regras de Commit

- Usar commits descritivos em português
- Prefixos recomendados:
  - `feat:` - Nova funcionalidade
  - `fix:` - Correção de bug
  - `style:` - Mudanças de estilo/formatação
  - `refactor:` - Refatoração de código
  - `docs:` - Documentação

## Próximos Passos Sugeridos

1. **Componentes Adicionais**: Input, Card, Badge, Toggle
2. **Interatividade**: Estado de formulários, navegação
3. **Testes**: Unit tests com Jest/Testing Library
4. **Performance**: Análise de bundle, otimizações
5. **Deployment**: Configuração para Vercel/produção

## Troubleshooting

### Problemas Comuns (ATUALIZADO)

1. **"Unknown at rule @theme"**: Verificar se `postcss.config.mjs` está configurado corretamente com `@tailwindcss/postcss`
2. **Classes CSS não funcionando**: 
   - Usar sintaxe correta: `bg-devroast-green` (não `bg-(--color-devroast-green)`)
   - Verificar se a variável está definida no `@theme` em `globals.css`
3. **Conflitos de fonte**: Confirmar que `font-mono` está sendo usado (não `font-(--font-jetbrains-mono)`)
4. **Build errors**: Verificar tipos TypeScript e imports
5. **CSS Variables não carregando**: Verificar se o PostCSS está processando o `@theme` corretamente

### Debug (ATUALIZADO)

- Usar DevTools para inspecionar se as classes semânticas foram geradas
- Verificar se o `@theme` está sendo processado pelo PostCSS
- Confirmar que não há sintaxe malformada como `text-(--color-*)`
- Verificar console do browser para erros de CSS
- Testar build com `npm run build` para detectar problemas

### Sintaxes que DEVEM ser evitadas no Tailwind v4

❌ **Classes malformadas:**
- `bg-(--color-devroast-green)` → Use `bg-devroast-green`
- `text-(--color-devroast-text-primary)` → Use `text-devroast-text-primary`
- `border-(--color-devroast-border)` → Use `border-devroast-border`
- `font-(--font-jetbrains-mono)` → Use `font-mono`

## Classes de Largura - Padrões Tailwind v4

### ✅ **Sintaxes CORRETAS para Width Classes**

**Spacing Scale (Recomendado para medidas exatas):**
```tsx
className="w-120"  // 30rem (480px) - calculado: 480px ÷ 4 = 120
className="w-140"  // 35rem (560px) - calculado: 560px ÷ 4 = 140  
className="w-195"  // 48.75rem (780px) - calculado: 780px ÷ 4 = 195
```

**Container Scale (Recomendado para layouts responsivos):**
```tsx
className="w-xs"   // 20rem (320px)
className="w-sm"   // 24rem (384px)
className="w-md"   // 28rem (448px)
className="w-lg"   // 32rem (512px)
className="w-xl"   // 36rem (576px)
className="w-2xl"  // 42rem (672px)
className="w-3xl"  // 48rem (768px)
className="w-4xl"  // 56rem (896px)
className="w-5xl"  // 64rem (1024px)
```

### ❌ **Sintaxes INCORRETAS (Evitar)**

```tsx
// Valores arbitrários em pixels - NUNCA usar
className="w-[480px]"  // ❌ Usar w-120
className="w-[560px]"  // ❌ Usar w-140  
className="w-[780px]"  // ❌ Usar w-195

// Valores arbitrários em rem - NUNCA usar
className="w-[32rem]"  // ❌ Usar w-lg
className="w-[48rem]"  // ❌ Usar w-3xl
```

### **Conversão Pixel → Spacing Scale**
**Fórmula**: `pixels ÷ 4 = spacing-unit`

- **480px** → 480 ÷ 4 = `w-120`
- **560px** → 560 ÷ 4 = `w-140` 
- **780px** → 780 ÷ 4 = `w-195`
- **320px** → 320 ÷ 4 = `w-80`

### **Quando usar cada tipo**

**Spacing Scale (`w-120`, `w-140`):**
- Para medidas exatas definidas no design
- Quando precisar de pixel-perfect fidelity
- Para componentes que não devem variar entre breakpoints

**Container Scale (`w-lg`, `w-xl`):**  
- Para layouts responsivos
- Quando o componente deve se adaptar a diferentes tamanhos
- Para seções que seguem breakpoints padrão

### **CSS Variables Definidas**
```css
/* globals.css - @theme */
--spacing-120: 30rem;    /* 480px */
--spacing-140: 35rem;    /* 560px */  
--spacing-195: 48.75rem; /* 780px */
```

---

**Nota**: Este documento deve ser atualizado sempre que novos padrões forem estabelecidos ou mudanças significativas forem feitas no projeto.

## Changelog - Width Classes Migration

**Data**: 2024-03-22  
**Migração**: Valores arbitrários de largura para classes semânticas Tailwind v4

### Alterações Realizadas:

1. **src/app/components/page.tsx**:
   - `w-[480px]` → `w-120` (Card component)
   - `w-[780px]` → `w-195` (CodeBlock component)
   - `w-[560px]` → `w-140` (DiffLine container)

2. **src/app/globals.css**:
   - Adicionadas variáveis CSS para spacing scale customizado:
     - `--spacing-120: 30rem` (480px)
     - `--spacing-140: 35rem` (560px)  
     - `--spacing-195: 48.75rem` (780px)

3. **Documentação Atualizada**:
   - **AGENTS.md**: Seção completa sobre Width Classes Best Practices
   - **CLAUDE.md**: Changelog e guias de conversão pixel→spacing
   - Exemplos de uso correto vs incorreto
   - Fórmulas de conversão e quando usar cada tipo

### Benefícios da Migration:
- ✅ **Consistência**: Classes seguem padrão semântico do Tailwind
- ✅ **Performance**: Classes nativas são mais eficientes que arbitrárias
- ✅ **Manutenibilidade**: Valores centralizados em CSS variables
- ✅ **Developer Experience**: Autocomplete e type safety melhorados
- ✅ **Bundle Size**: Redução no CSS final gerado

## 🎯 Homepage Implementation (Latest Update)

### **Primeira Seção Implementada - DevRoast Landing**

**Data**: 22 de Março de 2026
**Status**: ✅ Concluído

#### **Componentes Reutilizados na Homepage:**

1. **CodeBlockWithCopy** - Seção principal do editor de código
   - ✅ **Integração perfeita**: Substituiu implementação manual por componente reutilizável  
   - ✅ **Dimensões corretas**: `size="md"` = 360px altura (h-90) conforme Pencil
   - ✅ **Traffic lights**: Cores exatas (#EF4444, #F59E0B, #10B981)
   - ✅ **Line numbers**: 16 linhas, largura 48px, alinhamento à direita
   - ✅ **Syntax highlighting**: Cores de código mantidas do design original

2. **Toggle Component** - Roast mode switch
   - ✅ **Estado funcional**: Controle completo com `useState`
   - ✅ **Visual feedback**: Verde quando ativo, transições suaves
   - ✅ **Accessibility**: ARIA labels e keyboard navigation

3. **Button Component** - Submit action
   - ✅ **Variant primary**: Verde DevRoast com texto escuro
   - ✅ **Typography**: Font mono com comando shell style

4. **Typography Components** - Títulos e textos
   - ✅ **H1**: Título principal com font mono bold
   - ✅ **Text**: Subtítulo com IBM Plex Mono

#### **Especificações Técnicas Implementadas:**

```tsx
// Navbar - Altura 56px (h-14), padding horizontal 40px  
<nav className="flex h-14 items-center justify-between border-b border-devroast-border bg-devroast-bg px-10">

// Hero Title - Font size 36px (text-4xl)
<span className="font-mono text-4xl font-bold text-devroast-green">$</span>
<H1 className="font-mono text-4xl font-bold">paste your code. get roasted.</H1>

// Code Editor - Largura 780px (w-195), altura 360px
<CodeBlockWithCopy size="md" showHeader={true} showLineNumbers={true}>

// Actions Bar - Largura 780px, space-between layout  
<div className="flex w-195 items-center justify-between">

// Footer Stats - Gap 24px, center layout
<div className="flex items-center justify-center gap-6 pt-8">
```

#### **Benefícios da Reutilização:**

- **DRY Principle**: Eliminou ~100 linhas de código duplicado
- **Consistency**: Visual idêntico entre homepage e biblioteca de componentes  
- **Maintainability**: Mudanças no CodeBlock se propagam automaticamente
- **Performance**: Componente otimizado com caching e memoização
- **Accessibility**: Features completas de acessibilidade já implementadas

#### **Estrutura da Homepage Finalizada:**
```
✅ Navbar com logo e navegação
✅ Hero section com título e subtítulo  
✅ Code editor com syntax highlighting
✅ Actions bar com toggle e botão submit
✅ Footer com estatísticas do site
```

A homepage agora está **pixel-perfect** com o design Pencil e utiliza os componentes reutilizáveis de forma eficiente, demonstrando as melhores práticas de desenvolvimento React com Tailwind v4.
