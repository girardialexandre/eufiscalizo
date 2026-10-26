// Coletor de dados federais do Monitor de Promessas.
// Roda no GitHub Actions (ou localmente com Node 20+):  node coletor/coletar.mjs
//
// 1) Agenda do Presidente: lê o JSON público da agenda do Palácio do Planalto.
// 2) Gastos da Presidência: usa a API oficial do Portal da Transparência.
//    Precisa da variável de ambiente PORTAL_API_KEY (chave gratuita, veja o README).
//
// Os resultados são gravados em dados/agenda.js e dados/gastos.js.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARQ_AGENDA = path.join(RAIZ, "dados", "agenda.js");
const ARQ_GASTOS = path.join(RAIZ, "dados", "gastos.js");

const CONFIG = {
  inicioHistorico: process.env.INICIO || "2023-01-01", // início do período coberto
  agendaURL: "https://www.gov.br/planalto/pt-br/acompanhe-o-planalto/agenda-do-presidente-da-republica-lula/agenda-do-presidente-da-republica",
  apiURL: "https://api.portaldatransparencia.gov.br/api-de-dados",
  orgaoSuperior: "20000", // Presidência da República (órgão superior)
  orgao: "20101",         // Presidência da República (código SIAFI)
  mesesRecentesParaAtualizar: 4, // cartões e viagens chegam com atraso; reprocessa os últimos meses
  maxRequisicoesAPI: Number(process.env.MAX_REQ || 3000) // limite por execução; o resto fica para o dia seguinte
};

const UA = "Mozilla/5.0 (compatible; eufiscalizo/1.0; +https://github.com/girardialexandre/eufiscalizo)";
// Tempo máximo de espera por consulta (evita que a coleta trave se o servidor não responder)
const TEMPO_AGENDA_MS = 20000;
const TEMPO_API_MS = 60000;
const esperar = ms => new Promise(r => setTimeout(r, ms));
const hojeBR = () => new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const somaDias = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------- leitura/escrita dos arquivos window.X = {...}; ----------
async function lerJS(arquivo, nome) {
  try {
    const txt = await fs.readFile(arquivo, "utf8");
    const i = txt.indexOf(`window.${nome} =`);
    if (i < 0) return null;
    const corpo = txt.slice(i + `window.${nome} =`.length).trim().replace(/;\s*$/, "");
    return JSON.parse(corpo);
  } catch { return null; }
}
async function gravarJS(arquivo, nome, obj, comentario) {
  const txt = `// Gerado pelo coletor (coletor/coletar.mjs). Não editar à mão.\n// ${comentario}\nwindow.${nome} = ${JSON.stringify(obj, null, 1)};\n`;
  await fs.writeFile(arquivo, txt, "utf8");
}

// ---------- 1) AGENDA ----------
async function buscarDiaAgenda(data) {
  for (let t = 1; t <= 4; t++) {
    try {
      const r = await fetch(`${CONFIG.agendaURL}/json/${data}`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(TEMPO_AGENDA_MS) });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      const dia = Array.isArray(j) ? j.find(x => x.isSelected) : null;
      return (dia && dia.items || []).map(x => [
        x.start || "", (x.title || "").trim(), (x.location || "").trim(),
        (x.href || "").split(`/${data}/`).pop() || ""
      ]);
    } catch (e) {
      if (t === 4) throw new Error(`agenda ${data}: ${e.message}`);
      await esperar(1500 * t);
    }
  }
}

async function coletarAgenda() {
  const atual = await lerJS(ARQ_AGENDA, "AGENDA") || { dias: {}, cobertura: null };
  const dias = atual.dias || {};
  const hoje = hojeBR();
  const datas = new Set();

  // Histórico que ainda falta (antes da cobertura atual)
  const coberturaDe = atual.cobertura?.de || hoje;
  for (let d = CONFIG.inicioHistorico; d < coberturaDe; d = somaDias(d, 1)) datas.add(d);
  // Lacuna entre a última coleta e hoje
  const coberturaAte = atual.cobertura?.ate || CONFIG.inicioHistorico;
  for (let d = coberturaAte; d <= hoje; d = somaDias(d, 1)) datas.add(d);
  // A agenda pode ser corrigida em até 7 dias: revisita os últimos 10 e os próximos 7
  for (let n = -10; n <= 7; n++) datas.add(somaDias(hoje, n));

  const lista = [...datas].sort();
  log(`Agenda: ${lista.length} dias para consultar`);

  // Teste rápido: se o site do Planalto não responder, desiste logo em vez de travar
  try {
    const t0 = Date.now();
    await buscarDiaAgenda(hoje);
    log(`Agenda: site do Planalto respondeu em ${Date.now() - t0} ms`);
  } catch (e) {
    throw new Error(`site do Planalto não respondeu a partir deste servidor (${e.message}). Dados anteriores mantidos.`);
  }

  let i = 0, falhas = 0, feitos = 0;
  async function trabalhador() {
    while (i < lista.length) {
      const data = lista[i++];
      try {
        const itens = await buscarDiaAgenda(data);
        if (itens.length) dias[data] = itens; else delete dias[data];
      } catch (e) { falhas++; console.warn(e.message); }
      if (++feitos % 100 === 0) log(`Agenda: ${feitos}/${lista.length} dias consultados (${falhas} falhas)`);
      await esperar(150);
    }
  }
  await Promise.all([1, 2, 3].map(trabalhador));
  if (falhas > lista.length / 2) throw new Error(`Agenda: ${falhas} falhas em ${lista.length} consultas — mantendo dados anteriores`);

  const ordenado = Object.fromEntries(Object.keys(dias).sort().map(k => [k, dias[k]]));
  const novo = {
    atualizadoEm: hoje,
    fonte: CONFIG.agendaURL,
    cobertura: { de: CONFIG.inicioHistorico < coberturaDe ? CONFIG.inicioHistorico : coberturaDe, ate: hoje },
    dias: ordenado
  };
  await gravarJS(ARQ_AGENDA, "AGENDA", novo, "Fonte: agenda oficial do Presidente da República, Palácio do Planalto.");
  log(`Agenda: ${Object.keys(ordenado).length} dias com compromissos gravados (${falhas} falhas)`);
}

// ---------- 2) GASTOS ----------
let requisicoes = 0;
const numeroBR = v => {
  if (typeof v === "number") return v;
  const s = String(v ?? "").trim();
  if (!s) return 0;
  return s.includes(",") ? Number(s.replace(/\./g, "").replace(",", ".")) : Number(s);
};
const dd = n => String(n).padStart(2, "0");
const ultimoDia = (ano, mes) => new Date(Date.UTC(ano, mes, 0)).getUTCDate();

async function api(caminho, params) {
  if (requisicoes >= CONFIG.maxRequisicoesAPI) throw Object.assign(new Error("limite de requisições da execução atingido"), { limite: true });
  const url = `${CONFIG.apiURL}${caminho}?` + new URLSearchParams(params);
  for (let t = 1; t <= 5; t++) {
    requisicoes++;
    let r;
    try {
      r = await fetch(url, { headers: { "chave-api-dados": process.env.PORTAL_API_KEY.trim(), Accept: "application/json", "User-Agent": UA }, signal: AbortSignal.timeout(TEMPO_API_MS) });
    } catch (e) {
      if (t === 5) throw new Error(`API sem resposta em ${caminho} (${e.message})`);
      await esperar(5000 * t); continue;
    }
    if (r.ok) { await esperar(700); return r.json(); }
    if (r.status === 401 || r.status === 403) throw new Error(`API recusou a chave (HTTP ${r.status}). Confira o segredo PORTAL_API_KEY.`);
    if (r.status === 400) throw new Error(`API: parâmetros inválidos em ${caminho} (${await r.text()})`.slice(0, 300));
    await esperar(5000 * t); // 429 ou 5xx: espera e tenta de novo
  }
  throw new Error(`API: falha repetida em ${caminho}`);
}
async function todasPaginas(caminho, params) {
  const itens = [];
  for (let pagina = 1; ; pagina++) {
    const lote = await api(caminho, { ...params, pagina });
    if (!Array.isArray(lote) || lote.length === 0) break;
    itens.push(...lote);
  }
  return itens;
}

function mesesDesde(inicioISO) {
  const [a0, m0] = inicioISO.split("-").map(Number);
  const [a1, m1] = hojeBR().split("-").map(Number);
  const out = [];
  for (let a = a0, m = m0; a < a1 || (a === a1 && m <= m1); m === 12 ? (a++, m = 1) : m++) out.push([a, m]);
  return out;
}

async function coletarGastos() {
  if (!process.env.PORTAL_API_KEY) { log("Gastos: PORTAL_API_KEY não configurada — etapa ignorada."); return; }
  const g = await lerJS(ARQ_GASTOS, "GASTOS") || {};
  g.orgao = { codigo: CONFIG.orgao, nome: "Presidência da República" };
  g.fontes = {
    api: "https://api.portaldatransparencia.gov.br/swagger-ui/index.html",
    orgao: `https://portaldatransparencia.gov.br/orgaos/${CONFIG.orgao}`,
    cartoes: "https://portaldatransparencia.gov.br/cartoes",
    viagens: "https://portaldatransparencia.gov.br/viagens"
  };
  g.orcamento = g.orcamento || {}; g.cartoes = g.cartoes || {}; g.viagens = g.viagens || {};
  g.erros = [];
  const meses = mesesDesde(CONFIG.inicioHistorico.slice(0, 7) + "-01");
  const recentes = new Set(meses.slice(-CONFIG.mesesRecentesParaAtualizar).map(([a, m]) => `${a}-${dd(m)}`));

  try {
    // Execução orçamentária por órgão (ano a ano; o ano corrente é sempre atualizado)
    const anoAtual = Number(hojeBR().slice(0, 4));
    for (let ano = Number(CONFIG.inicioHistorico.slice(0, 4)); ano <= anoAtual; ano++) {
      if (g.orcamento[ano] && ano < anoAtual) continue;
      const linhas = await todasPaginas("/despesas/por-orgao", { ano, orgaoSuperior: CONFIG.orgaoSuperior });
      const orgaos = linhas.map(l => ({ codigo: l.codigoOrgao, nome: l.orgao, empenhado: numeroBR(l.empenhado), liquidado: numeroBR(l.liquidado), pago: numeroBR(l.pago) }))
        .sort((a, b) => b.pago - a.pago);
      g.orcamento[ano] = { orgaos };
      log(`Orçamento ${ano}: ${orgaos.length} órgãos`);
    }

    // Cartão de pagamento (cartão corporativo) da Presidência, mês a mês
    for (const [a, m] of meses) {
      const chave = `${a}-${dd(m)}`;
      if (g.cartoes[chave] && !recentes.has(chave)) continue;
      const mes = `${dd(m)}/${a}`;
      const regs = await todasPaginas("/cartoes", { mesExtratoInicio: mes, mesExtratoFim: mes, codigoOrgao: CONFIG.orgao });
      const porEstab = {};
      let total = 0, sig = 0, sigQtd = 0;
      for (const r of regs) {
        const v = numeroBR(r.valorTransacao);
        total += v;
        const nome = (r.estabelecimento?.nome || r.estabelecimento?.razaoSocialReceita || "Não informado").trim();
        if (/sigilos/i.test(nome) || /sigilos/i.test(r.portador?.nome || "")) { sig += v; sigQtd++; }
        const e = porEstab[nome] || (porEstab[nome] = [nome, 0, 0]);
        e[1] += v; e[2]++;
      }
      const top = Object.values(porEstab).sort((x, y) => y[1] - x[1]).slice(0, 30).map(([n, v, q]) => [n, Math.round(v * 100) / 100, q]);
      g.cartoes[chave] = { total: Math.round(total * 100) / 100, qtd: regs.length, sigiloso: Math.round(sig * 100) / 100, sigilosoQtd: sigQtd, top };
      log(`Cartões ${chave}: ${regs.length} transações`);
    }

    // Viagens a serviço pagas pela Presidência, por mês de ida
    for (const [a, m] of meses) {
      const chave = `${a}-${dd(m)}`;
      if (g.viagens[chave] && !recentes.has(chave)) continue;
      const ini = `01/${dd(m)}/${a}`, fim = `${ultimoDia(a, m)}/${dd(m)}/${a}`;
      // A API exige os dois intervalos; o de retorno cobre até 1 ano depois da ida
      const fimRetorno = `${ultimoDia(a + 1, m)}/${dd(m)}/${a + 1}`;
      const regs = await todasPaginas("/viagens", { dataIdaDe: ini, dataIdaAte: fim, dataRetornoDe: ini, dataRetornoAte: fimRetorno, codigoOrgao: CONFIG.orgao });
      let passagens = 0, diarias = 0, total = 0, internacionais = 0;
      for (const r of regs) {
        passagens += numeroBR(r.valorTotalPassagem);
        diarias += numeroBR(r.valorTotalDiarias);
        total += numeroBR(r.valorTotalViagem);
        if (/internac/i.test(r.tipoViagem || "")) internacionais++;
      }
      const arred = v => Math.round(v * 100) / 100;
      g.viagens[chave] = { qtd: regs.length, internacionais, passagens: arred(passagens), diarias: arred(diarias), total: arred(total) };
      log(`Viagens ${chave}: ${regs.length}`);
    }
  } catch (e) {
    if (e.limite) log("Gastos: limite de requisições atingido; a coleta continua na próxima execução.");
    else { console.error(e.message); g.erros.push(e.message); }
  }

  g.atualizadoEm = hojeBR();
  const ordenar = o => Object.fromEntries(Object.keys(o).sort().map(k => [k, o[k]]));
  g.orcamento = ordenar(g.orcamento); g.cartoes = ordenar(g.cartoes); g.viagens = ordenar(g.viagens);
  await gravarJS(ARQ_GASTOS, "GASTOS", g, "Fonte: API de dados do Portal da Transparência (CGU).");
  log(`Gastos gravados (${requisicoes} requisições à API)`);
}

// ---------- execução ----------
let erro = false;
try { await coletarAgenda(); } catch (e) { erro = true; console.error("Falha na agenda:", e.message); }
try { await coletarGastos(); } catch (e) { erro = true; console.error("Falha nos gastos:", e.message); }
process.exitCode = erro ? 1 : 0;
