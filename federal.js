(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtData = d => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || ""); return m ? `${m[3]}/${m[2]}/${m[1]}` : esc(d); };
  const num = n => Number(n || 0).toLocaleString("pt-BR");
  const brl = n => Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const MESES_LONGO = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const rotMes = k => { const [a, m] = k.split("-"); return `${MESES[+m - 1]}/${a.slice(2)}`; };

  function barras(el, linhas, fmt = num) {
    if (!linhas.length) { el.innerHTML = `<p class="vazio">Sem dados no período.</p>`; return; }
    const max = Math.max(...linhas.map(l => l[1])) || 1;
    el.innerHTML = linhas.map(([rot, v, extra]) =>
      `<div class="barra-linha"><span class="rot" title="${esc(rot)}">${esc(rot)}</span>
        <div class="trilho"><i style="width:${Math.max(2, (v / max) * 100)}%"></i></div>
        <span class="v">${fmt(v)}${extra ? ` · ${esc(extra)}` : ""}</span></div>`).join("");
  }

  // ---------- Abas ----------
  function abrirAba(qual) {
    ["agenda", "gastos"].forEach(a => {
      $("aba-" + a).setAttribute("aria-selected", a === qual);
      $("painel-" + a).hidden = a !== qual;
    });
    try { history.replaceState(null, "", "#" + qual); } catch (e) {}
  }
  $("aba-agenda").onclick = () => abrirAba("agenda");
  $("aba-gastos").onclick = () => abrirAba("gastos");

  // ---------- AGENDA ----------
  const A = window.AGENDA || { dias: {}, cobertura: null };
  const TIPOS = [
    ["viagem", "Deslocamentos", /^(partida|chegada|retorno)\b/i],
    ["imprensa", "Discursos e imprensa", /(^|\s)(entrevista|podcast|coletiva|pronunciamento|intervenç|declaraç\S* (conjunta )?à imprensa|anúncio à imprensa|live\b)/i],
    ["internacional", "Agenda internacional", /\b(telefonema|presidente da república (da|do|de|dos) (?!federativa)|primeir[oa]-ministr|rei |rainha |embaixador|cartas credenciais|nações unidas|chanceler|secretário-geral da onu|cúpula|g20|brics|mercosul)\b/i],
    ["ato", "Atos e cerimônias", /\b(sanção|assinatura|promulgação|cerimônia|solenidade|posse|lançamento|anúncio|inauguração|entrega|decreto)\b/i],
    ["visita", "Visitas", /^visita\b/i],
    ["reuniao", "Reuniões e audiências", /.*/]
  ];
  const tipoDe = titulo => TIPOS.find(t => t[2].test(titulo))[0];
  const nomeTipo = Object.fromEntries(TIPOS.map(t => [t[0], t[1]]));

  const todos = [];
  Object.entries(A.dias || {}).forEach(([data, itens]) => itens.forEach(([hora, titulo, local, slug]) =>
    todos.push({ data, hora, titulo, local, slug, tipo: tipoDe(titulo) })));
  todos.sort((a, b) => (b.data + b.hora).localeCompare(a.data + a.hora) || 0);

  const cobDe = A.cobertura?.de, cobAte = A.cobertura?.ate;
  $("agenda-meta").textContent = cobDe
    ? `Dados de ${fmtData(cobDe)} a ${fmtData(cobAte)} · atualizado em ${fmtData(A.atualizadoEm)}`
    : "Ainda não há dados de agenda coletados.";

  // Períodos disponíveis
  const somaDias = (iso, n) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const periodos = [];
  if (cobAte) {
    periodos.push(["30d", "Últimos 30 dias", somaDias(cobAte, -29), cobAte]);
    periodos.push(["90d", "Últimos 90 dias", somaDias(cobAte, -89), cobAte]);
    const anos = [...new Set(Object.keys(A.dias).map(d => d.slice(0, 4)))].sort().reverse();
    anos.forEach(a => periodos.push([a, `Ano de ${a}`, `${a}-01-01`, `${a}-12-31`]));
    const meses = [...new Set(Object.keys(A.dias).map(d => d.slice(0, 7)))].sort().reverse().slice(0, 24);
    meses.forEach(m => { const [a, mm] = m.split("-"); periodos.push([m, `${MESES_LONGO[+mm - 1]} de ${a}`, `${m}-01`, `${m}-31`]); });
    periodos.push(["tudo", "Todo o período coletado", cobDe, cobAte]);
  }
  $("agenda-periodo").innerHTML = periodos.map(p => `<option value="${p[0]}">${esc(p[1])}</option>`).join("");

  const filtro = { tipo: "todos", busca: "", limite: 40 };

  function intervalo() {
    const p = periodos.find(x => x[0] === $("agenda-periodo").value) || periodos[0];
    if (!p) return null;
    const de = p[2] < cobDe ? cobDe : p[2], ate = p[3] > cobAte ? cobAte : p[3];
    return { de, ate };
  }

  function renderAgenda() {
    const iv = intervalo();
    if (!iv) { $("agenda-kpis").innerHTML = ""; $("agenda-lista").innerHTML = `<p class="nada">Os dados da agenda aparecem aqui após a primeira coleta.</p>`; return; }
    const doPeriodo = todos.filter(c => c.data >= iv.de && c.data <= iv.ate);
    const diasCom = new Set(doPeriodo.map(c => c.data));
    let diasUteis = 0, uteisSem = 0;
    for (let d = iv.de; d <= iv.ate; d = somaDias(d, 1)) {
      const wd = new Date(d + "T12:00:00Z").getUTCDay();
      if (wd >= 1 && wd <= 5) { diasUteis++; if (!diasCom.has(d)) uteisSem++; }
    }
    const partidas = doPeriodo.filter(c => /^partida para/i.test(c.titulo) && !/bras[ií]lia/i.test(c.titulo));
    const intl = doPeriodo.filter(c => c.tipo === "internacional").length;
    $("agenda-kpis").innerHTML = [
      [num(doPeriodo.length), "compromissos publicados"],
      [`${num(diasCom.size)}`, "dias com agenda publicada"],
      [`${num(uteisSem)} de ${num(diasUteis)}`, "dias úteis sem compromisso publicado"],
      [num(partidas.length), "viagens (partidas para fora de Brasília)"],
      [num(intl), "compromissos internacionais"]
    ].map(([v, r]) => `<div class="kpi"><b>${v}</b><small>${esc(r)}</small></div>`).join("");

    const cont = {}; doPeriodo.forEach(c => cont[c.tipo] = (cont[c.tipo] || 0) + 1);
    barras($("agenda-tipos"), TIPOS.map(t => [t[1], cont[t[0]] || 0]).filter(l => l[1]).sort((a, b) => b[1] - a[1]));

    const dest = {};
    doPeriodo.filter(c => /^chegada (a|ao|à|em)\b/i.test(c.titulo)).forEach(c => {
      const cid = c.titulo.replace(/^chegada (a|ao|à|em)\s+/i, "").replace(/\s*\(.*?\)\s*$/, "").trim();
      if (!/^bras[ií]lia$/i.test(cid)) dest[cid] = (dest[cid] || 0) + 1;
    });
    barras($("agenda-destinos"), Object.entries(dest).sort((a, b) => b[1] - a[1]).slice(0, 8));

    const inter = {};
    doPeriodo.filter(c => c.tipo === "reuniao").forEach(c => inter[c.titulo] = (inter[c.titulo] || 0) + 1);
    barras($("agenda-interlocutores"), Object.entries(inter).filter(e => e[1] > 1).sort((a, b) => b[1] - a[1]).slice(0, 8));

    // Chips de tipo
    $("agenda-chips").innerHTML = [["todos", "Todos"], ...TIPOS.map(t => [t[0], t[1]])].map(([k, r]) =>
      `<button class="chip" data-tipo="${k}" aria-pressed="${filtro.tipo === k}">${esc(r)}</button>`).join("");
    document.querySelectorAll("#agenda-chips .chip").forEach(b => b.onclick = () => { filtro.tipo = b.dataset.tipo; filtro.limite = 40; renderAgenda(); });

    // Lista
    const q = filtro.busca.trim().toLowerCase();
    const lista = doPeriodo.filter(c => (filtro.tipo === "todos" || c.tipo === filtro.tipo) &&
      (!q || (c.titulo + " " + c.local).toLowerCase().includes(q)));
    const porDia = {};
    lista.forEach(c => (porDia[c.data] = porDia[c.data] || []).push(c));
    const diasOrd = Object.keys(porDia).sort().reverse();
    const visiveis = diasOrd.slice(0, filtro.limite);
    $("agenda-lista").innerHTML = visiveis.length ? visiveis.map(d => {
      const dt = new Date(d + "T12:00:00Z");
      const rot = dt.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
      return `<div class="dia"><h4>${esc(rot.charAt(0).toUpperCase() + rot.slice(1))}</h4>${porDia[d].sort((a, b) => a.hora.localeCompare(b.hora)).map(c => {
        const link = c.slug ? `${A.fonte}/${d}/${encodeURIComponent(c.slug)}` : A.fonte;
        return `<div class="comp"><time>${esc(c.hora)}</time><div>
          <div class="tit"><a href="${esc(link)}" target="_blank" rel="noopener">${esc(c.titulo)}</a><span class="tag">${esc(nomeTipo[c.tipo])}</span></div>
          ${c.local ? `<div class="loc">${esc(c.local)}</div>` : ""}</div></div>`;
      }).join("")}</div>`;
    }).join("") : `<p class="nada">Nenhum compromisso encontrado.</p>`;
    $("agenda-mais-wrap").innerHTML = diasOrd.length > filtro.limite
      ? `<button class="mais" id="agenda-mais">Mostrar mais dias (${diasOrd.length - filtro.limite} restantes)</button>` : "";
    if ($("agenda-mais")) $("agenda-mais").onclick = () => { filtro.limite += 40; renderAgenda(); };
  }

  $("agenda-periodo").onchange = () => { filtro.limite = 40; renderAgenda(); };
  $("agenda-busca").oninput = e => { filtro.busca = e.target.value; filtro.limite = 40; renderAgenda(); };
  renderAgenda();

  // ---------- GASTOS ----------
  const G = window.GASTOS;
  function renderGastosVazio() {
    const erro = G && G.erros && G.erros.length
      ? `<div class="aviso"><b>A última coleta de gastos (${fmtData(G.atualizadoEm)}) falhou:</b> ${G.erros.map(esc).join("; ")}</div>` : "";
    $("gastos-conteudo").innerHTML = erro + `<div class="aviso"><b>Os gastos ainda não foram ativados.</b>
      <p style="margin:6px 0 0">Eles vêm da API oficial do Portal da Transparência, que exige uma chave gratuita. Para ativar:</p>
      <ol>
        <li>Cadastre seu e-mail em <a href="https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email" target="_blank" rel="noopener">portaldatransparencia.gov.br/api-de-dados</a> (login gov.br) e receba a chave.</li>
        <li>No repositório do GitHub, vá em <b>Settings → Secrets and variables → Actions → New repository secret</b>, crie o segredo <code>PORTAL_API_KEY</code> e cole a chave.</li>
        <li>Na aba <b>Actions</b>, abra "Coletar agenda e gastos federais" e clique em <b>Run workflow</b>. Depois disso, a coleta roda sozinha todas as noites.</li>
      </ol></div>
      <p class="nota">Serão mostrados: execução do orçamento dos órgãos da Presidência, gastos com cartão de pagamento (cartão corporativo) e viagens a serviço pagas pela Presidência da República.</p>`;
  }

  function renderGastos() {
    if (!G || (!Object.keys(G.cartoes || {}).length && !Object.keys(G.orcamento || {}).length)) { renderGastosVazio(); return; }
    const anos = [...new Set([...Object.keys(G.orcamento || {}), ...Object.keys(G.cartoes || {}).map(k => k.slice(0, 4))])].sort().reverse();
    const ano = $("gastos-ano")?.value || anos[0];
    const cart = Object.entries(G.cartoes || {}).filter(([k]) => k.startsWith(ano));
    const viag = Object.entries(G.viagens || {}).filter(([k]) => k.startsWith(ano));
    const orc = (G.orcamento || {})[ano];
    const soma = (arr, campo) => arr.reduce((s, [, v]) => s + (v[campo] || 0), 0);
    const cTotal = soma(cart, "total"), cQtd = soma(cart, "qtd"), cSig = soma(cart, "sigiloso");
    const vTotal = soma(viag, "total"), vQtd = soma(viag, "qtd"), vInt = soma(viag, "internacionais");
    const vPass = soma(viag, "passagens"), vDiar = soma(viag, "diarias");
    const ultimoCart = cart.filter(([, v]) => v.qtd).map(([k]) => k).sort().pop();

    const estab = {};
    cart.forEach(([, v]) => (v.top || []).forEach(([n, val, q]) => { const e = estab[n] || (estab[n] = [n, 0, 0]); e[1] += val; e[2] += q; }));

    $("gastos-conteudo").innerHTML = `
      <p class="meta-line">Órgão: ${esc(G.orgao?.nome || "Presidência da República")} (SIAFI ${esc(G.orgao?.codigo || "20101")}) · atualizado em ${fmtData(G.atualizadoEm)}</p>
      ${G.erros && G.erros.length ? `<div class="aviso"><b>A última coleta teve problemas:</b> ${G.erros.map(esc).join("; ")}</div>` : ""}
      <div class="linha-filtros"><label for="gastos-ano">Ano</label>
        <select id="gastos-ano">${anos.map(a => `<option ${a === ano ? "selected" : ""}>${a}</option>`).join("")}</select></div>
      <div class="kpis">
        <div class="kpi"><b>${brl(cTotal)}</b><small>cartão corporativo no ano${ultimoCart ? ` (até ${rotMes(ultimoCart)})` : ""}</small></div>
        <div class="kpi"><b>${cTotal ? Math.round(cSig / cTotal * 100) : 0}%</b><small>do cartão sob sigilo (${brl(cSig)})</small></div>
        <div class="kpi"><b>${num(vQtd)}</b><small>viagens a serviço (${num(vInt)} internacionais)</small></div>
        <div class="kpi"><b>${brl(vTotal)}</b><small>custo total das viagens</small></div>
      </div>
      <div class="cartoes2">
        <div class="bloco"><h3>Cartão corporativo por mês</h3><p class="nota">${num(cQtd)} transações. Dados publicados com cerca de 2 meses de atraso.</p><div class="barras" id="g-cart-mes"></div></div>
        <div class="bloco"><h3>Maiores recebedores do cartão</h3><p class="nota">Soma dos maiores estabelecimentos de cada mês. "Sigiloso" são gastos protegidos por lei por razões de segurança.</p><div class="barras" id="g-cart-top"></div></div>
        <div class="bloco"><h3>Viagens a serviço por mês</h3><p class="nota">Passagens ${brl(vPass)} · diárias ${brl(vDiar)} no ano.</p><div class="barras" id="g-viag-mes"></div></div>
      </div>
      ${orc ? `<div class="bloco"><h3>Execução do orçamento em ${esc(ano)}</h3>
        <p class="nota">Órgãos ligados à Presidência da República. Pago inclui só o que já saiu do caixa no ano.</p>
        <div class="rolagem"><table class="tab"><thead><tr><th>Órgão</th><th class="n">Empenhado</th><th class="n">Liquidado</th><th class="n">Pago</th></tr></thead><tbody>
        ${orc.orgaos.map(o => `<tr><td>${esc(o.nome)}</td><td class="n">${brl(o.empenhado)}</td><td class="n">${brl(o.liquidado)}</td><td class="n">${brl(o.pago)}</td></tr>`).join("")}
        </tbody></table></div></div>` : ""}
      <p class="nota" style="margin-top:12px">Conferir na fonte: <a href="${esc(G.fontes?.orgao || "https://portaldatransparencia.gov.br/orgaos/20101")}" target="_blank" rel="noopener">Presidência no Portal da Transparência</a> · <a href="${esc(G.fontes?.cartoes || "https://portaldatransparencia.gov.br/cartoes")}" target="_blank" rel="noopener">cartões</a> · <a href="${esc(G.fontes?.viagens || "https://portaldatransparencia.gov.br/viagens")}" target="_blank" rel="noopener">viagens</a></p>`;

    barras($("g-cart-mes"), cart.map(([k, v]) => [rotMes(k), v.total]), brl);
    barras($("g-cart-top"), Object.values(estab).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([n, v, q]) => [n, v, `${num(q)}x`]), brl);
    barras($("g-viag-mes"), viag.map(([k, v]) => [rotMes(k), v.total, `${num(v.qtd)} ${v.qtd === 1 ? "viagem" : "viagens"}`]), brl);
    $("gastos-ano").onchange = renderGastos;
  }
  renderGastos();

  abrirAba(location.hash === "#gastos" ? "gastos" : "agenda");
})();
