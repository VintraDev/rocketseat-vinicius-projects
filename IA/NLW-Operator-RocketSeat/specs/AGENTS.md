# Specs - Guia Rápido

Use esta pasta para definir a feature antes da implementação.

## Formato obrigatório

Cada spec deve ser um arquivo `.md` com esta estrutura mínima:

```md
# <Nome da feature>

## Objetivo
<o problema e o resultado esperado em 2-4 linhas>

## Escopo
- Incluir:
  - ...
- Não incluir:
  - ...

## Requisitos
- Funcionais:
  - RF01 ...
- Não funcionais:
  - RNF01 ...

## Abordagem técnica
- Arquivos/componentes impactados
- Decisões principais
- Dependências novas (se houver)

## Critérios de aceite
- [ ] Cenário validável 1
- [ ] Cenário validável 2

## Plano de implementação
1. Passo incremental 1
2. Passo incremental 2
```

## Regras

- Seja direto: foco em clareza e execução.
- Descreva **o que** e **por que**; evite detalhar código prematuramente.
- Mantenha a spec atualizada quando o escopo mudar.
