# UI Component Patterns

This file documents the standards for creating and evolving UI components in `src/components/ui`.

## tailwind-variants usage

- Use `tailwind-variants` (`tv`) as the source of truth for style composition.
- Do not use external merge helpers (for example `cn`) when rendering components that already use `tv`.
- Pass `className` directly into the `tv` function call with the other variant props.

Example:

```tsx
className={buttonVariants({ className, variant, size, fullWidth, responsive })}
```

## Responsive Design Patterns (NOVO - IMPLEMENTADO)

### ✅ MOBILE-FIRST APPROACH
Todos os componentes agora seguem uma abordagem **mobile-first** responsiva:

```tsx
// Breakpoints implementados
--breakpoint-xs: 20rem; /* 320px - Small mobile */
--breakpoint-sm: 40rem; /* 640px - Large mobile */
--breakpoint-md: 48rem; /* 768px - Tablet */
--breakpoint-lg: 64rem; /* 1024px - Desktop */
--breakpoint-xl: 80rem; /* 1280px - Large desktop */
```

### ✅ COMPONENT RESPONSIVE PATTERNS

#### **Button Responsivo:**
```tsx
// Mobile-first sizing and responsive width
<Button responsive={true} variant="primary">
  $ roast_my_code
</Button>

// Renderiza como:
// Mobile: w-full (largura completa)
// Desktop: w-auto (largura automática)
```

#### **Card Responsivo:**
```tsx
// Card adaptativo
<Card responsive={true} padding="md">
  <CardContent>...</CardContent>
</Card>

// Renderiza como:
// Mobile: w-full p-3 (largura completa, padding reduzido)
// Desktop: lg:w-120 sm:p-5 (480px de largura, padding original)
```

#### **CodeBlock Responsivo:**
```tsx
// Editor de código adaptativo
<CodeBlockWithCopy responsive={true} showLineNumbers={true}>
  {code}
</CodeBlockWithCopy>

// Comportamento:
// Mobile: line numbers ocultos, overflow-x-auto
// Desktop: line numbers visíveis, largura controlada
```

#### **LeaderboardRow Responsivo:**
```tsx
// Tabela que vira cards no mobile
<LeaderboardRow
  responsive={true}
  rank={1}
  score={2.1}
  code="eval(prompt('code'))"
  language="javascript"
/>

// Renderiza como:
// Mobile: Card layout com ranking badge
// Desktop: Tabela tradicional
```

#### **Typography Responsivo:**
```tsx
// Tipografia adaptativa (aplicado automaticamente)
<H1>paste your code. get roasted.</H1>

// Renderiza como:
// Mobile: text-2xl (24px)
// Tablet: sm:text-3xl (30px)  
// Desktop: lg:text-4xl (36px)
```

### ✅ BREAKPOINT UTILITIES

#### **Container Responsivo:**
```tsx
// Layout responsivo
<div className="px-4 sm:px-6 lg:px-10">
  // Mobile: 16px padding
  // Tablet: 24px padding
  // Desktop: 40px padding
</div>
```

#### **Text Sizing Responsivo:**
```tsx
// Tamanhos adaptativos
className="text-xs sm:text-sm lg:text-base"
// Mobile: 12px → Tablet: 14px → Desktop: 16px
```

#### **Spacing Responsivo:**
```tsx
// Espaçamento adaptativo
className="space-y-4 lg:space-y-6"
// Mobile: 16px gap → Desktop: 24px gap
```

## Component API shape

- Public props should combine native element props with `VariantProps<typeof ...Variants>`.
- Keep `type="button"` as default on button-like components.
- Forward refs with `forwardRef` and set a `displayName`.

## Styling tokens (ATUALIZADO TAILWIND V4 + RESPONSIVO)

- **SEMPRE** use classes semânticas geradas pelo `@theme` em `src/app/globals.css` instead of hardcoded values.
- **SEMPRE** use abordagem mobile-first para responsividade.
- Keep semantic naming for DevRoast tokens (for example `--color-devroast-green`, `--color-devroast-text-primary`).
- Map component states (default, hover, focus, disabled) to explicit variables whenever possible.

### ✅ SINTAXE CORRETA Tailwind v4 + Responsivo:
```tsx
// Classes semânticas geradas automaticamente pelo @theme
className="bg-devroast-green"           // Fundo verde
className="text-devroast-text-primary"  // Texto principal
className="border-devroast-border"      // Borda
className="font-mono"                   // Fonte mono

// Responsividade mobile-first
className="w-full lg:w-195"             // Full mobile → 780px desktop
className="px-4 sm:px-6 lg:px-10"      // 16px → 24px → 40px
className="text-sm sm:text-base lg:text-lg" // 14px → 16px → 18px
className="hidden lg:flex"              // Oculto mobile, visível desktop
```

### ❌ SINTAXE INCORRETA (OBSOLETA):
```tsx
// NUNCA use estas sintaxes - são malformadas no Tailwind v4
className="bg-(--color-devroast-green)"        // ❌ Malformada
className="text-(--color-devroast-text-primary)" // ❌ Malformada  
className="border-(--color-devroast-border)"     // ❌ Malformada
className="w-[780px]"                            // ❌ Usar w-full lg:w-195
className="desktop:hidden"                      // ❌ Usar hidden lg:flex
```

## Width Classes - Responsive Best Practices

### ✅ SINTAXE RESPONSIVA CORRETA:
```tsx
// Mobile-first responsive widths
className="w-full lg:w-120"     // Full mobile → 480px desktop
className="w-full md:w-140"     // Full mobile → 560px tablet+
className="w-full lg:w-195"     // Full mobile → 780px desktop

// Container responsive
className="w-full max-w-6xl"    // Fluid com max-width
className="mx-auto px-4 lg:px-10" // Center com padding responsivo
```

### ❌ SINTAXE NÃO-RESPONSIVA (EVITAR):
```tsx
className="w-120"   // ❌ Fixed width - usar w-full lg:w-120
className="w-195"   // ❌ Fixed width - usar w-full lg:w-195  
className="px-10"   // ❌ Fixed padding - usar px-4 lg:px-10
```

## DevRoast Color System

Use estas variáveis CSS específicas para o projeto:

```css
/* Cores principais */
--color-devroast-bg: #0a0a0a              # Fundo principal
--color-devroast-text-primary: #fafafa     # Texto principal branco
--color-devroast-text-secondary: #6b7280   # Texto secundário cinza
--color-devroast-text-muted: #4b5563       # Texto menos relevante
--color-devroast-border: #2a2a2a           # Bordas
--color-devroast-surface: #0f0f0f          # Superfícies/containers
--color-devroast-green: #10b981            # Verde principal (botões, acentos)
--color-devroast-orange: #f59e0b           # Laranja (badges warning)
--color-devroast-red: #ef4444              # Vermelho (badges error)
--color-devroast-code-orange: #ffc799      # Laranja específico para código
/* Sistema responsivo */
--spacing-responsive-xs: 1rem;    /* 16px mobile */
--spacing-responsive-sm: 1.5rem;  /* 24px tablet */
--spacing-responsive-md: 2.5rem;  /* 40px desktop */
```

## Typography Guidelines - Mobile-First

- **Font families**: 
  - `font-mono` para elementos de código, UI components, headings
  - `font-sans` para texto corrido (pouco usado no DevRoast)
- **Weights**: Preferir `font-bold` para headings, `font-medium` para botões
- **Sizes**: Mobile-first approach:
  - `text-xs sm:text-sm` (12px → 14px)
  - `text-sm sm:text-base` (14px → 16px)
  - `text-lg sm:text-xl lg:text-2xl` (18px → 20px → 24px)

## Variants organization

- Keep `base`, `variants`, and `defaultVariants` explicit and small.
- Use `variant` for visual intent and `size` for dimensions/typography.
- Add boolean variants for structural toggles (for example `fullWidth`, `responsive`).
- **SEMPRE incluir variant `responsive`** para componentes que devem se adaptar.

## DevRoast Button Specifications - Responsivo

```tsx
// Primary Button Responsivo
<Button variant="primary" responsive={true}>
  $ roast_my_code
</Button>

// Mobile: w-full px-4 py-2 text-xs
// Desktop: w-auto sm:px-6 sm:py-2.5 sm:text-[13px]
// Background: --color-devroast-green (#10B981)
// Text: --color-devroast-bg (#0A0A0A)  
// Border radius: 0px (sharp corners)
```

## Responsive Layout Patterns

### ✅ NAVBAR RESPONSIVO:
```tsx
<nav className="px-4 sm:px-6 lg:px-10 h-14">
  {/* Logo com tamanhos adaptativos */}
  <span className="text-lg sm:text-xl font-bold">devroast</span>
  
  {/* Link oculto no mobile */}
  <div className="hidden sm:flex">
    <span>leaderboard</span>
  </div>
</nav>
```

### ✅ GRID RESPONSIVO:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  {items.map(item => (
    <Card responsive={true} key={item.id}>
      {item.content}
    </Card>
  ))}
</div>
```

### ✅ LEADERBOARD ADAPTATIVO:
```tsx
{/* Header oculto no mobile */}
<div className="hidden md:flex">Table Header</div>

{/* Cards no mobile, tabela no desktop */}
<div className="space-y-3 md:space-y-0">
  {data.map(item => (
    <LeaderboardRow responsive={true} {...item} />
  ))}
</div>
```

## Accessibility baseline - Responsivo

- Ensure focus-visible styles are present for interactive components across all screen sizes.
- Preserve disabled semantics with `disabled:pointer-events-none` and reduced opacity.
- Keep text contrast aligned with design tokens in all breakpoints.
- **Touch targets**: Minimum 44px on mobile for interactive elements.
- **Navigation**: Ensure keyboard navigation works on all screen sizes.

## Best Practices - Responsive

1. **Mobile-first sempre** - comece com mobile, expanda para desktop
2. **Test em dispositivos reais** além de dev tools
3. **Usar font-mono** para manter consistência com o tema terminal/código
4. **Sharp corners** (radius 0) para botões principais seguindo o design
5. **Test components** na página `/components` em múltiplos breakpoints
6. **Manter pixel-perfect** em desktop preservando usabilidade mobile
7. **Overflow handling** - sempre considere scroll horizontal/vertical
8. **Performance** - evite layouts shift entre breakpoints

## Migration Guide: Tornando Componentes Responsivos

### Passo 1: Adicionar variant responsive
```tsx
const componentVariants = tv({
  variants: {
    // ... outras variants
    responsive: {
      true: "w-full lg:w-120", // ou comportamento específico
      false: "w-120", // comportamento original
    },
  },
  defaultVariants: {
    responsive: false, // mantém backward compatibility
  },
});
```

### Passo 2: Atualizar Props Interface
```tsx
export interface ComponentProps extends VariantProps<typeof componentVariants> {
  responsive?: boolean;
  // ... outras props
}
```

### Passo 3: Implementar Mobile-first Classes
```tsx
// OLD: className="px-6 py-3 text-base"
// NEW: className="px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base"
```

### Passo 4: Test e Refinar
- Test no DevTools responsive mode
- Test na página `/components` 
- Verificar em dispositivos móveis reais

---

**Status**: ✅ **SISTEMA RESPONSIVO COMPLETO IMPLEMENTADO**
- Mobile-first approach em todos os componentes
- Breakpoints consistentes e documentados  
- Padrões de design preservados em todas as telas
- Backward compatibility mantida com `responsive={false}`
