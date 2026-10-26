# Eu Fiscalizo

Acompanhamento independente e apartidário das promessas de governo 2027–2030 e da agenda e dos gastos do Presidente da República, feito só com dados públicos.

**Site:** https://girardialexandre.github.io/eufiscalizo/

- **Promessas** (`index.html`): propostas do governo federal e dos 27 governos estaduais, com critério de cumprimento, onde verificar e evidências.
- **Agenda e gastos do Presidente** (`federal.html`): agenda oficial do Presidente e gastos da Presidência, atualizados todas as noites por um robô.

Site estático (HTML + JavaScript puro, sem build), publicado de graça pelo GitHub Pages.

## Estrutura

```
index.html        → página de promessas
app.js            → lógica da página de promessas
dados.js          → propostas do governo federal (editado à mão)
estados/xx.js     → propostas de cada governador eleito (ex.: estados/sc.js)
federal.html      → página "Agenda e gastos do Presidente"
federal.js        → lógica dessa página
estilo.css        → visual compartilhado
dados/agenda.js   → agenda do Presidente (gerado pelo robô, não editar)
dados/gastos.js   → gastos da Presidência (gerado pelo robô, não editar)
coletor/coletar.mjs           → script que coleta agenda e gastos
.github/workflows/coletar.yml → roda o coletor todas as noites
```

Para testar localmente, basta abrir o `index.html` no navegador.

## Promessas

No topo da página há um seletor para trocar entre o governo federal e os 27 governos estaduais.

- Abrir direto um estado: `https://girardialexandre.github.io/eufiscalizo/?uf=SC`
- Abrir uma proposta específica: `?uf=SC#sc-estrada-boa` (federal: `#fim-6x1`)

Sobre os planos estaduais:
- Foram extraídas as 7 a 12 propostas mais verificáveis de cada plano registrado no TSE, não a lista completa.
- Pernambuco registrou o plano como PDF escaneado; as propostas vieram dos destaques divulgados pela imprensa e merecem conferência com o documento oficial.
- Pará, Rio Grande do Norte, Ceará e Rio Grande do Sul têm planos com poucas metas numéricas; nesses casos o critério de cumprimento usa indicadores oficiais.

### Como atualizar uma proposta

Em `dados.js` (federal) ou `estados/xx.js` (estadual), encontre a proposta pelo `id`, mude o `status` e adicione uma evidência com link para fonte oficial:

```js
status: "em_andamento",
evidencias: [
  { data: "2027-03-15", descricao: "PEC aprovada na CCJ da Câmara", link: "https://www.camara.leg.br/..." }
]
```

Status válidos: `aguardando`, `nao_iniciada`, `em_andamento`, `parcial`, `cumprida`, `abandonada`.
No federal, atualize também `atualizadoEm` em `window.META`.

## Agenda e gastos do Presidente

- **Agenda:** compromissos publicados pelo Palácio do Planalto, com resumo por período (compromissos, dias úteis sem agenda publicada, viagens, destinos, interlocutores mais frequentes), busca e link para cada publicação oficial.
- **Gastos:** cartão corporativo da Presidência por mês (incluindo a parcela sob sigilo), viagens a serviço e execução do orçamento dos órgãos da Presidência.

### Como a coleta funciona

O robô (GitHub Actions) roda **todos os dias às 03h17** (horário de Brasília), executa `coletor/coletar.mjs` e grava o resultado em `dados/`, com um commit "Atualiza agenda e gastos federais". O GitHub Pages republica o site em seguida.

**Agenda** (fonte: JSON público da agenda do Planalto, sem chave):
- A primeira execução busca todo o histórico desde **1º/01/2023**, cerca de 1.400 dias, e leva **uns 30 minutos** (o Planalto responde devagar).
- Nas noites seguintes, consulta só os dias desde a última coleta, os **últimos 10 dias** (a agenda pode ser corrigida em até 7 dias) e os **próximos 7 dias**. Leva menos de um minuto.
- Cada consulta tem tempo-limite de 20 s; antes de começar, o coletor testa se o Planalto responde. Se não responder, desiste e mantém os dados anteriores.
- O andamento aparece no log a cada 100 dias consultados.

**Gastos** (fonte: API de dados do Portal da Transparência, exige chave):
- Órgão: Presidência da República (SIAFI 20101; órgão superior 20000).
- Cartões e viagens são consultados mês a mês desde 2023; os **últimos 4 meses** são sempre reprocessados, porque o Portal publica esses dados com atraso.
- O robô faz no máximo **3.000 consultas por execução** para respeitar o limite da API. A carga inicial pode levar **duas ou três noites**; depois, cada noite processa só o necessário.
- Erros da última coleta aparecem na própria aba Gastos, e o log completo fica na aba **Actions**.

### Configuração (já feita neste repositório)

1. **Settings → Actions → General → Workflow permissions:** *Read and write permissions* (para o robô salvar os dados).
2. **Settings → Secrets and variables → Actions:** segredo `PORTAL_API_KEY` com a chave da API.
3. **Settings → Pages:** *Deploy from a branch*, `main`, pasta `/ (root)`.

Para rodar a coleta na hora: **Actions → Coletar agenda e gastos federais → Run workflow**.

### Chave da API do Portal da Transparência

- Cadastro gratuito em https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email (login gov.br).
- O e-mail traz algo como `[{"key":"chave-api-dados","value":"SUA-CHAVE"}]`. No segredo vai **só o valor** (`SUA-CHAVE`), sem aspas nem colchetes. O nome do cabeçalho (`chave-api-dados`) o coletor já envia sozinho.
- A chave fica criptografada no GitHub e não aparece no código, no site nem nos logs. **Nunca** coloque a chave em um arquivo do repositório: o histórico de commits é público.
- Para trocar: Settings → Secrets → lápis ao lado de `PORTAL_API_KEY`.

### Ajustes comuns

- **Mudar o início do histórico:** variável `INICIO` (padrão `2023-01-01`), por exemplo no passo "Coletar dados" do workflow: `INICIO: "2027-01-01"`.
- **Limite de consultas à API por execução:** variável `MAX_REQ` (padrão `3000`).
- **Horário da coleta:** linha `cron` em `.github/workflows/coletar.yml` (o horário é em UTC; `17 6 * * *` = 03h17 em Brasília).

## Editar e publicar a partir do computador

A pasta local é `C:\Projetos\eufiscalizo`. Como o robô faz commits todas as noites, **sempre puxe as mudanças antes de enviar**:

```
cd C:\Projetos\eufiscalizo
git pull --rebase
git add -A
git commit -m "Descreva a mudança"
git push
```

Se aparecer *"detected dubious ownership"*: `git config --global --add safe.directory C:/Projetos/eufiscalizo`.

Também dá para editar direto no GitHub (ícone de lápis no arquivo) e fazer o commit pela página.

## Limitações

- A agenda oficial em geral não detalha compromissos privados e de fim de semana. "Dias úteis sem compromisso publicado" não desconta feriados e não significa ausência de trabalho.
- A classificação dos compromissos (deslocamentos, atos, imprensa etc.) é automática, pelo título.
- Gastos sob sigilo (segurança do Presidente) aparecem só como total, como no próprio Portal da Transparência.

## Fontes úteis para verificação

- Agenda do Presidente: https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/agenda-do-presidente-da-republica
- Portal da Transparência: https://portaldatransparencia.gov.br (API: https://api.portaldatransparencia.gov.br/swagger-ui/index.html)
- Planos de governo (TSE): https://divulgacandcontas.tse.jus.br
- Câmara: https://dadosabertos.camara.leg.br
- Senado: https://www12.senado.leg.br/dados-abertos
- IBGE (SIDRA): https://sidra.ibge.gov.br
- Tesouro Nacional: https://www.tesourotransparente.gov.br
- INEP: https://www.gov.br/inep
