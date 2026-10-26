# Monitor de Promessas

Site estático (HTML + JS puro, sem build) para acompanhar o cumprimento das propostas do plano de governo 2027–2030.

## Estrutura

```
index.html        → página de promessas (não precisa mexer)
app.js            → lógica da página de promessas
dados.js          → propostas do governo federal
estados/xx.js     → propostas de cada governador eleito (ex.: estados/sc.js)
federal.html      → página "Agenda e gastos do Presidente"
federal.js        → lógica dessa página
estilo.css        → visual compartilhado
dados/agenda.js   → agenda do Presidente (gerado automaticamente)
dados/gastos.js   → gastos da Presidência (gerado automaticamente)
coletor/coletar.mjs           → script que coleta agenda e gastos
.github/workflows/coletar.yml → agenda a coleta todas as noites no GitHub
```

No topo da página há um seletor para trocar entre o governo federal e os 27 governos estaduais.
Para abrir direto um estado, use `?uf=` no endereço: `seusite/?uf=SC`.
Para abrir uma proposta específica: `seusite/?uf=SC#sc-estrada-boa`.

Observações sobre os planos estaduais:
- Foram extraídas as 7 a 12 propostas mais verificáveis de cada plano registrado no TSE, não a lista completa.
- Pernambuco registrou o plano como PDF escaneado; as propostas vieram dos destaques divulgados pela imprensa e merecem conferência com o documento oficial.
- Pará, Rio Grande do Norte, Ceará e Rio Grande do Sul têm planos com poucas metas numéricas; nesses casos o critério de cumprimento usa indicadores oficiais.

Para testar localmente, basta abrir o `index.html` no navegador.

## Como atualizar uma proposta

Em `dados.js` (federal) ou em `estados/xx.js` (estadual), encontre a proposta pelo `id`, mude o `status` e adicione uma evidência:

```js
status: "em_andamento",
evidencias: [
  { data: "2027-03-15", descricao: "PEC aprovada na CCJ da Câmara", link: "https://www.camara.leg.br/..." }
]
```

Status válidos: `aguardando`, `nao_iniciada`, `em_andamento`, `parcial`, `cumprida`, `abandonada`.

Atualize também `atualizadoEm` em `window.META`.

Dica: cada proposta tem link direto, por exemplo `seusite/#fim-6x1`.

## Agenda e gastos do Presidente (federal.html)

A página tem duas abas:

- **Agenda**: compromissos publicados pelo Palácio do Planalto, com resumo por período (compromissos, dias úteis sem agenda publicada, viagens, destinos, interlocutores mais frequentes) e busca.
- **Gastos**: cartão corporativo da Presidência por mês (incluindo a parcela sob sigilo), viagens a serviço e execução do orçamento dos órgãos da Presidência.

Os dados são atualizados por um robô gratuito do GitHub (GitHub Actions) que roda todas as noites e grava os arquivos em `dados/`.
Por isso, **para a atualização automática funcionar o site precisa estar no GitHub** (Netlify Drop serve só para a versão parada).

### Ativar a coleta

1. Publique pelo GitHub Pages (abaixo). Confira se a pasta `.github/workflows` foi enviada: ela é oculta e alguns sistemas não mostram. Se faltar, no GitHub use **Add file → Create new file**, digite o nome `.github/workflows/coletar.yml` e cole o conteúdo do arquivo.
2. Em **Settings → Actions → General → Workflow permissions**, marque **Read and write permissions**.
3. Na aba **Actions**, abra "Coletar agenda e gastos federais" e clique em **Run workflow**. A primeira execução busca a agenda desde janeiro de 2023 e pode levar alguns minutos.

### Ativar os gastos

Os gastos usam a API oficial do Portal da Transparência, que exige uma chave gratuita:

1. Cadastre-se em https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email (login gov.br). A chave chega por e-mail.
2. No repositório: **Settings → Secrets and variables → Actions → New repository secret**. Nome: `PORTAL_API_KEY`. Valor: a chave.
3. Rode o workflow de novo. A carga inicial (desde 2023) pode precisar de duas ou três noites, porque o robô respeita o limite de consultas da API.

Se algo der errado, a própria aba Gastos mostra a mensagem de erro da última coleta, e o log completo fica na aba Actions.

## Publicar de graça

### Opção 1 — GitHub Pages (recomendada)
O histórico de commits fica público, o que dá transparência às mudanças de status.

1. Crie um repositório público no GitHub (ex.: `monitor-promessas`).
2. Envie `index.html` e `dados.js` para a branch `main`.
3. Em **Settings → Pages**, escolha *Deploy from a branch*, branch `main`, pasta `/ (root)`.
4. O site fica em `https://SEU-USUARIO.github.io/monitor-promessas/`.

Para atualizar, edite o `dados.js` direto no GitHub (ícone de lápis) e faça o commit.

### Opção 2 — Netlify Drop (mais rápida)
1. Acesse https://app.netlify.com/drop
2. Arraste a pasta `monitor-promessas`.
3. Para atualizar, arraste a pasta de novo no mesmo site (em *Deploys*).

### Opção 3 — Cloudflare Pages
Conecte o repositório do GitHub em **Workers & Pages → Create → Pages**. Sem comando de build, diretório de saída `/`.

## Fontes úteis para verificação
- Câmara: https://dadosabertos.camara.leg.br
- Senado: https://www12.senado.leg.br/dados-abertos
- Portal da Transparência: https://portaldatransparencia.gov.br
- IBGE (SIDRA): https://sidra.ibge.gov.br
- Tesouro Nacional: https://www.tesourotransparente.gov.br
- INEP: https://www.gov.br/inep
