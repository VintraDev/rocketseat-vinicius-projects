# Implementacao do tRPC como camada de API/backend

## Objetivo
Padronizar a camada de API/backend do projeto com tRPC, substituindo chamadas diretas em componentes por procedures tipadas e reutilizaveis.
Garantir integracao nativa com Next.js App Router, incluindo suporte a SSR, React Server Components e hidracao com TanStack Query.
Reduzir duplicacao de tipos entre frontend e backend e melhorar a evolucao da base para features futuras.

## Escopo
- Incluir:
  - Setup base do tRPC v11 com TanStack React Query.
  - Definicao de `context`, `router` raiz e procedures base (query/mutation).
  - Endpoint HTTP em `app/api/trpc/[trpc]/route.ts` via fetch adapter.
  - Provider global no App Router para client components.
  - Integracao com server components usando `createTRPCOptionsProxy`, prefetch e hydration boundary.
  - Primeira procedure de dominio para metricas da homepage (total de roasted codes e avg score), consumindo `src/db/queries.ts`.
  - Padronizacao de validacao de entrada/saida com Zod.
- Nao incluir:
  - Implementacao de outros routers de dominio alem de metricas nesta fase.
  - Migracao completa de todas as telas do projeto na primeira entrega.
  - Regras de autenticacao/autorizacao avancadas (RBAC, ACL, multi-tenant).
  - Cache distribuido (Redis) e observabilidade avancada.
  - Publicacao de API externa (OpenAPI/SDK publico) nesta fase.

## Requisitos
- Funcionais:
  - RF01 Criar infraestrutura tRPC com router principal e context por request.
  - RF02 Expor procedure para leitura das metricas da homepage.
  - RF03 Integrar homepage para consumir essa procedure com Server Components + Suspense.
  - RF04 Permitir consumo em client components via `useQuery`/`useMutation` com tipos inferidos.
  - RF05 Permitir prefetch em server components com hidratacao no cliente para evitar waterfall.
  - RF06 Disponibilizar caller server-side para cenarios que precisem de dados somente no servidor.
- Nao funcionais:
  - RNF01 Manter type-safety fim a fim sem duplicar tipos manuais entre client e server.
  - RNF02 Garantir isolamento de cache por request no servidor (sem compartilhamento indevido).
  - RNF03 Definir `staleTime` padrao para SSR evitando refetch imediato na hidratacao.
  - RNF04 Seguir convencoes do projeto (estrutura em `src/`, Zod para validacao, Next App Router).
  - RNF05 Manter base preparada para streaming/Suspense sem bloquear renderizacao inicial por padrao.

## Abordagem tecnica
- Arquivos/componentes impactados
  - `package.json` (novas dependencias tRPC/TanStack quando necessario).
  - `src/server/trpc/init.ts` (initTRPC, context, helpers base).
  - `src/server/trpc/routers/_app.ts` (router raiz e export do tipo `AppRouter`).
  - `src/server/trpc/routers/metrics.ts` (dominio inicial).
  - `src/app/api/trpc/[trpc]/route.ts` (adapter HTTP para GET/POST).
  - `src/trpc/query-client.ts` (factory de QueryClient com defaults para SSR/RSC).
  - `src/trpc/client.tsx` (TRPCProvider + cliente para client components).
  - `src/trpc/server.tsx` (proxy para server components, `getQueryClient`, helper de hydration/prefetch).
  - `src/app/layout.tsx` (montagem do provider global).
- Decisoes principais
  - Usar tRPC v11 com `@trpc/tanstack-react-query` (novo cliente recomendado).
  - Adotar padrao de integracao para RSC com prefetch no servidor e hydration boundary no cliente.
  - Evitar acoplamento da UI com SQL direto; componentes acessam apenas procedures tRPC.
  - Definir fronteira clara: `src/db/queries.ts` permanece como camada de acesso a dados.
  - Iniciar com subset de routers para entrega incremental e migracao segura.
- Dependencias novas (se houver)
  - `@trpc/server`
  - `@trpc/client`
  - `@trpc/tanstack-react-query`
  - `@tanstack/react-query`
  - `zod` (confirmar versao em uso e alinhar se necessario)
  - `server-only` e `client-only` (conforme recomendacao para separar ambientes)

## Criterios de aceite
- [ ] Existe endpoint funcional em `/api/trpc` respondendo queries e mutations basicas.
- [ ] O app possui provider tRPC + QueryClient configurado no App Router sem quebrar renderizacao.
- [ ] Uma pagina server component faz prefetch de query tRPC e hidrata no client component corretamente.
- [ ] Router de metricas da homepage esta ativo com validacao Zod.
- [ ] Tipos de entrada/saida sao inferidos automaticamente no frontend sem declaracoes duplicadas.
- [ ] Nao ha compartilhamento de QueryClient entre requests no servidor.

## Plano de implementacao
1. Instalar dependencias e criar estrutura base tRPC (`init`, router raiz, endpoint HTTP).
2. Configurar QueryClient factory e provider para client components no layout.
3. Implementar camada RSC (`src/trpc/server.tsx`) com `getQueryClient`, proxy e hydration helper.
4. Criar router inicial (`metrics`) conectando com `src/db/queries.ts` e Zod.
5. Migrar as metricas da homepage para consumir tRPC com prefetch server-side.
6. Validar cenarios de SSR/RSC, tipos inferidos e comportamento de cache/hidratacao.
7. Documentar convencoes de uso (quando usar caller server-side vs prefetch/hydrate).
