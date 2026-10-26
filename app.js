(function () {
  const STATUS = {
    aguardando:   { nome: "Aguardando",   cor: "var(--s-aguardando)" },
    nao_iniciada: { nome: "Não iniciada", cor: "var(--s-nao_iniciada)" },
    em_andamento: { nome: "Em andamento", cor: "var(--s-em_andamento)" },
    parcial:      { nome: "Parcial",      cor: "var(--s-parcial)" },
    cumprida:     { nome: "Cumprida",     cor: "var(--s-cumprida)" },
    abandonada:   { nome: "Abandonada",   cor: "var(--s-abandonada)" }
  };

  const META = window.META || {};
  const norm = lista => (lista || []).map(p => ({
    ...p, status: STATUS[p.status] ? p.status : "aguardando", evidencias: p.evidencias || []
  }));

  // Esferas: Federal + estados
  const ESFERAS = {
    BR: {
      nome: "Brasil (Federal)",
      titulo: META.titulo || "Monitor de Promessas",
      subtitulo: META.subtitulo || "",
      fontePlano: META.fontePlano,
      propostas: norm(window.PROMESSAS)
    }
  };
  Object.entries(window.ESFERAS || {}).forEach(([uf, e]) => {
    ESFERAS[uf] = { ...e, propostas: norm(e.propostas) };
  });
  const ordemUF = Object.keys(ESFERAS).filter(k => k !== "BR")
    .sort((a, b) => ESFERAS[a].nome.localeCompare(ESFERAS[b].nome, "pt-BR"));

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtData = d => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || "");
    return m ? `${m[3]}/${m[2]}/${m[1]}` : esc(d);
  };
  const linkSeguro = u => /^https?:\/\//i.test(u || "") ? u : null;

  // Esfera inicial: ?uf=SC na URL, ou Federal
  let ufParam = "BR";
  try { ufParam = (new URLSearchParams(location.search).get("uf") || "BR").toUpperCase(); } catch (e) {}
  const estado = { uf: ESFERAS[ufParam] ? ufParam : "BR", eixo: "Todos", status: null, busca: "" };
  const atual = () => ESFERAS[estado.uf];

  // Seletor
  $("seletor").innerHTML =
    `<option value="BR">${esc(ESFERAS.BR.nome)}</option>` +
    `<optgroup label="Governos estaduais">` +
    ordemUF.map(uf => `<option value="${uf}">${esc(ESFERAS[uf].nome)} (${uf})</option>`).join("") +
    `</optgroup>`;
  $("seletor").value = estado.uf;
  $("seletor").addEventListener("change", e => {
    estado.uf = e.target.value; estado.eixo = "Todos"; estado.status = null;
    estado.busca = ""; $("busca").value = "";
    try {
      const url = new URL(location.href);
      if (estado.uf === "BR") url.searchParams.delete("uf"); else url.searchParams.set("uf", estado.uf);
      url.hash = "";
      history.replaceState(null, "", url);
    } catch (err) {}
    renderTudo();
  });

  function renderCabecalho() {
    const e = atual();
    const federal = estado.uf === "BR";
    $("titulo").textContent = federal ? e.titulo : `Monitor de Promessas — ${e.nome}`;
    $("subtitulo").textContent = federal ? e.subtitulo
      : "Acompanhamento das propostas do plano de governo registrado no TSE pelo governador eleito";
    $("metaLinha").textContent =
      `Mandato ${META.mandato || "2027–2030"} · Atualizado em ${fmtData(e.atualizadoEm || META.atualizadoEm)}`;
    document.title = $("titulo").textContent;
    const link = linkSeguro(e.fontePlano);
    if (link) $("linkPlano").href = link; else $("linkPlano").removeAttribute("href");

    const gov = $("gov");
    if (federal) { gov.hidden = true; gov.innerHTML = ""; return; }
    gov.hidden = false;
    gov.innerHTML =
      `<b>${esc(e.governante)}</b>${e.vice ? ` · vice ${esc(e.vice)}` : ""}${e.eleicao ? ` · ${esc(e.eleicao)}` : ""}` +
      (link ? ` · <a href="${esc(link)}" target="_blank" rel="noopener">plano registrado no TSE</a>` : "") +
      (e.observacao ? `<p class="obs">${esc(e.observacao)}</p>` : "");
  }

  function renderResumo() {
    const dados = atual().propostas;
    const total = dados.length;
    const cont = {};
    Object.keys(STATUS).forEach(k => cont[k] = 0);
    dados.forEach(p => cont[p.status]++);
    $("totalTxt").textContent = `${total} propostas monitoradas · ${cont.cumprida} cumpridas`;
    $("barra").innerHTML = Object.keys(STATUS).filter(k => cont[k]).map(k =>
      `<span title="${STATUS[k].nome}: ${cont[k]}" style="width:${(cont[k] / total) * 100}%;background:${STATUS[k].cor}"></span>`
    ).join("");
    $("contadores").innerHTML = Object.keys(STATUS).map(k =>
      `<button class="contador" data-status="${k}" aria-pressed="${estado.status === k}">
         <b>${cont[k]}</b><small><i class="dot" style="background:${STATUS[k].cor}"></i>${STATUS[k].nome}</small>
       </button>`).join("");
    document.querySelectorAll(".contador").forEach(b => b.onclick = () => {
      estado.status = estado.status === b.dataset.status ? null : b.dataset.status;
      renderResumo(); renderLista();
    });
  }

  function renderChips() {
    const eixos = ["Todos", ...new Set(atual().propostas.map(p => p.eixo))];
    $("chips").innerHTML = eixos.map(e =>
      `<button class="chip" aria-pressed="${estado.eixo === e}" data-eixo="${esc(e)}">${esc(e)}</button>`).join("");
    document.querySelectorAll(".chip").forEach(c => c.onclick = () => {
      estado.eixo = c.dataset.eixo; renderChips(); renderLista();
    });
  }

  function renderLista() {
    const q = estado.busca.trim().toLowerCase();
    const filtrados = atual().propostas.filter(p =>
      (estado.eixo === "Todos" || p.eixo === estado.eixo) &&
      (!estado.status || p.status === estado.status) &&
      (!q || [p.titulo, p.plano, p.criterio, p.eixo].join(" ").toLowerCase().includes(q)));

    if (!filtrados.length) { $("lista").innerHTML = `<p class="nada">Nenhuma proposta encontrada.</p>`; return; }

    const grupos = {};
    filtrados.forEach(p => (grupos[p.eixo] = grupos[p.eixo] || []).push(p));

    $("lista").innerHTML = Object.entries(grupos).map(([eixo, itens]) => `
      <section class="grupo"><h2>${esc(eixo)}</h2>
        ${itens.map(p => {
          const s = STATUS[p.status];
          const evid = [...p.evidencias].sort((a, b) => String(b.data).localeCompare(String(a.data)));
          return `<details id="${esc(p.id)}">
            <summary><span class="t">${esc(p.titulo)}</span>
              <span class="badge" style="background:${s.cor}">${s.nome}</span></summary>
            <div class="corpo">
              <h3>O que diz o plano</h3><p>${esc(p.plano)}</p>
              <h3>Critério de cumprimento</h3><p>${esc(p.criterio)}</p>
              <h3>Onde verificar</h3><p>${esc(p.verificar)}</p>
              <h3>Evidências</h3>
              ${evid.length ? `<ul class="evid">${evid.map(e => {
                const u = linkSeguro(e.link);
                return `<li><time>${fmtData(e.data)}</time>${esc(e.descricao)}${u ? ` · <a href="${esc(u)}" target="_blank" rel="noopener">fonte</a>` : ""}</li>`;
              }).join("")}</ul>` : `<p class="vazio">Nenhuma evidência registrada ainda.</p>`}
            </div>
          </details>`;
        }).join("")}
      </section>`).join("");

    // Abre a proposta indicada no endereço (ex.: ?uf=SC#sc-estrada-boa)
    let alvo = null;
    try { alvo = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) {}
    if (alvo && alvo.tagName === "DETAILS") alvo.open = true;
  }

  function renderTudo() { renderCabecalho(); renderResumo(); renderChips(); renderLista(); }

  $("busca").addEventListener("input", e => { estado.busca = e.target.value; renderLista(); });
  renderTudo();
})();
